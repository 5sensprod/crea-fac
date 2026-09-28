#!/usr/bin/env python
"""Génère une facture ou un devis PDF sans interface : sert le projet, pilote index.html en
Chromium headless et déclenche l'export html2pdf de l'application.

Le rendu est donc strictement identique à celui du bouton « Télécharger en PDF ».
"""

import argparse
import base64
import functools
import http.server
import json
import mimetypes
import re
import socketserver
import subprocess
import sys
import threading
import unicodedata
from datetime import date, timedelta
from pathlib import Path

RACINE = Path(__file__).resolve().parents[3]
SORTIE = RACINE / "output" / "pdf"
LOGO = RACINE / "assets" / "logo.jpg"

mimetypes.add_type("application/javascript", ".js")


def charger_donnees():
    """Lit data/*.js via node pour ne jamais dupliquer les données métier."""
    script = """
    const u = (p) => new URL(p, 'file:///' + process.argv[1].replace(/\\\\/g, '/') + '/');
    Promise.all([
      import(u('data/clients.js')),
      import(u('data/produits.js')),
      import(u('data/tarifs.js')),
      import(u('data/parametres.js')),
    ]).then(([c, p, t, s]) => {
      process.stdout.write(JSON.stringify({
        clients: c.clients, produits: p.produits, tarifs: t.tarifs,
        parametres: s.parametres,
      }));
    });
    """
    res = subprocess.run(
        ["node", "-e", script, str(RACINE)],
        capture_output=True, text=True, encoding="utf-8", check=True,
    )
    return json.loads(res.stdout)


def slug(valeur):
    valeur = unicodedata.normalize("NFKD", valeur).encode("ascii", "ignore").decode()
    return re.sub(r"-+", "-", re.sub(r"[^A-Za-z0-9]+", "-", valeur)).strip("-").upper()


def prochain_numero(prefixe):
    """Numéro suivant d'après les PDF déjà présents dans output/pdf."""
    used = [
        int(m.group(1))
        for f in SORTIE.glob("*.pdf")
        if (m := re.search(rf"{prefixe}(\d{{4}})", f.name))
    ]
    return f"{max(used) + 1:04d}" if used else "0001"


def logo_data_url():
    if not LOGO.exists():
        return ""
    mime = mimetypes.guess_type(LOGO.name)[0] or "image/jpeg"
    return f"data:{mime};base64," + base64.b64encode(LOGO.read_bytes()).decode()


def demarrer_serveur():
    class Handler(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass

    handler = functools.partial(Handler, directory=str(RACINE))
    httpd = socketserver.TCPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, httpd.server_address[1]


REMPLIR_JS = """
({ lignes, numero, dateFacture, regime, reglement, client, type }) => {
  const set = (sel, val) => {
    const el = document.querySelector(sel);
    el.value = val;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };

  document.querySelector('#typeDocumentSelect').value = type;
  document.querySelector('#typeDocumentSelect')
    .dispatchEvent(new Event('change', { bubbles: true }));

  document.querySelectorAll('#linesTable tbody .del-btn').forEach((b) => b.click());

  document.querySelector('#regimeTvaSelect').value = regime;
  document.querySelector('#regimeTvaSelect')
    .dispatchEvent(new Event('change', { bubbles: true }));

  document.querySelector('#clientSelect').value = client;
  document.querySelector('#applyClientBtn').click();

  set('#dateFactureInput', dateFacture);
  set('#numeroSuffix', numero);
  set('#reglementInput', reglement);
  set('#echeanceMode', reglement);

  for (const ligne of lignes) {
    document.querySelector('#produitSelect').value = ligne.produitId;
    document.querySelector('#addProductBtn').click();
    const tr = document.querySelector('#linesTable tbody tr:last-child');
    set2(tr.querySelector('.desc input'), ligne.description);
    set2(tr.querySelector('.qte'), ligne.qte);
    // Sans --prix explicite, on garde le tarif que l'application a appliqué
    // pour le régime en cours (data/tarifs.js).
    if (ligne.prixUnitaire) set2(tr.querySelector('.pu'), ligne.prixUnitaire);
  }

  function set2(el, val) {
    el.value = val;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  if (type === 'facture') {
    set('#soldeDu', document.querySelector('#netAPayer').textContent);
  }
  return document.querySelector('#netAPayer').textContent;
}
"""


def generer(args):
    from playwright.sync_api import sync_playwright

    donnees = charger_donnees()
    prefixe = (
        donnees["parametres"]["devis"]["prefixeNumero"]
        if args.type == "devis"
        else donnees["parametres"]["facture"]["prefixeNumero"]
    )

    client = next(
        (c for c in donnees["clients"] if c["code"].upper() == args.client.upper()),
        None,
    )
    if client is None:
        codes = ", ".join(c["code"] for c in donnees["clients"])
        sys.exit(f"Client inconnu : {args.client}. Codes disponibles : {codes}")

    lignes = []
    for brut in args.ligne:
        parts = [p.strip() for p in brut.split("|")]
        if len(parts) < 3:
            sys.exit(f"Ligne invalide : {brut} (format CODE|Description|Qté[|PU])")
        code, description, qte = parts[0], parts[1], parts[2]
        produit = next(
            (p for p in donnees["produits"] if p["code"].upper() == code.upper()), None
        )
        if produit is None:
            codes = ", ".join(p["code"] for p in donnees["produits"])
            sys.exit(f"Service inconnu : {code}. Codes disponibles : {codes}")
        prix = parts[3] if len(parts) > 3 else ""
        lignes.append(
            {
                "produitId": produit["id"],
                "description": description,
                "qte": f"{float(qte.replace(',', '.')):.2f}".replace(".", ","),
                "prixUnitaire": (
                    f"{float(prix.replace(',', '.')):.2f}".replace(".", ",")
                    if prix
                    else ""
                ),
            }
        )

    date_facture = args.date or date.today().isoformat()
    numero_suffixe = args.numero or prochain_numero(f"{prefixe}{date_facture[:4]}")
    numero = f"{prefixe}{date_facture[:4]}{numero_suffixe}"
    cible = SORTIE / f"{numero}_{slug(client['nom'])}.pdf"
    SORTIE.mkdir(parents=True, exist_ok=True)

    httpd, port = demarrer_serveur()
    logo = logo_data_url()

    try:
        with sync_playwright() as pw:
            navigateur = pw.chromium.launch()
            contexte = navigateur.new_context(accept_downloads=True)
            contexte.add_init_script(
                "localStorage.setItem('crea-fac.settings.v1', "
                + json.dumps(json.dumps({"logoDataUrl": logo}))
                + ")"
            )
            page = contexte.new_page()
            page.goto(f"http://127.0.0.1:{port}/index.html")
            page.wait_for_function("() => !!window.html2pdf")

            net = page.evaluate(
                REMPLIR_JS,
                {
                    "lignes": lignes,
                    "numero": numero_suffixe,
                    "dateFacture": date_facture,
                    "regime": args.regime,
                    "reglement": args.reglement,
                    "client": client["id"],
                    "type": args.type,
                },
            )

            with page.expect_download(timeout=120_000) as info:
                page.click("#pdfBtn")
            info.value.save_as(cible)
            navigateur.close()
    finally:
        httpd.shutdown()

    jours = (
        donnees["parametres"]["devis"]["validiteJours"]
        if args.type == "devis"
        else donnees["parametres"]["facture"]["delaiEcheanceJours"]
    )
    limite = (date.fromisoformat(date_facture) + timedelta(days=jours)).isoformat()
    libelle = "validité" if args.type == "devis" else "échéance"
    print(f"{cible}")
    print(
        f"{numero} | {client['nom']} | {date_facture} | {libelle} {limite} | total {net}"
    )


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description="Génère une facture ou un devis PDF.")
    parser.add_argument(
        "--type",
        default="facture",
        choices=["facture", "devis"],
        help="Type de document (défaut : facture)",
    )
    parser.add_argument("--client", required=True, help="Code client, ex. 2BPOGNY")
    parser.add_argument(
        "--ligne",
        action="append",
        required=True,
        metavar="CODE|Description|Qté[|PU]",
        help="Répétable. Ex. 'AR00011|Communication Web|0,5'",
    )
    parser.add_argument("--date", help="Date de facture ISO (défaut : aujourd'hui)")
    parser.add_argument("--numero", help="Suffixe 4 chiffres (défaut : suivant dispo)")
    parser.add_argument(
        "--regime",
        default="standard",
        choices=["standard", "franchise-en-base"],
        help="Régime TVA (défaut : standard, TVA 20 %%)",
    )
    parser.add_argument("--reglement", default="Virement bancaire")
    generer(parser.parse_args())


if __name__ == "__main__":
    main()
