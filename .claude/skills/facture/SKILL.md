---
name: facture
description: Génère une facture ou un devis PDF CreaFAC en ligne de commande, sans navigateur ni Live Server. À utiliser dès que l'utilisateur dit « génère une facture », « fais un devis », etc. Demande d'abord pour qui, pour quoi et les infos manquantes, peut ajouter un client ou un service au catalogue, puis produit le PDF dans output/pdf/.
---

# Générer une facture ou un devis

## 1. Recueillir les infos avant de générer

Ne jamais deviner ce qui manque. Avec **AskUserQuestion** (une seule salve, 4 questions max),
demander uniquement ce que la demande ne précise pas :

| Info | Question | Défaut si l'utilisateur ne tranche pas |
| --- | --- | --- |
| Type | Facture ou devis ? | facture |
| Client | Pour qui ? (proposer les codes existants + « Nouveau client ») | — obligatoire |
| Prestations | Quoi, combien d'heures / de lots, prix exceptionnel ? | — obligatoire |
| Régime | Avec TVA (société) ou sans TVA (auto-entrepreneur) ? | avec TVA |
| Date | Date de facture | aujourd'hui |

Pour connaître les clients et services existants, lire `data/clients.js`,
`data/produits.js` et `data/tarifs.js`. Rattacher chaque prestation au service qui
correspond le mieux (ex. travaux design → `AR00014` Graphisme, modif site → `AR00004`)
et l'indiquer dans la réponse finale.

Avant de lancer, résumer en une ligne : client, lignes, total HT estimé. Si la demande
était déjà complète, lancer directement sans poser de question.

## 2. Ajouter un client ou un service si besoin

**Nouveau client** — demander nom / raison sociale, adresse, CP, ville, email (optionnel),
puis ajouter une entrée à `data/clients.js` :

```js
  {
    id: "cli-00X",          // suivant libre
    code: "CODECOURT",      // majuscules, sans espace
    nom: "SARL Exemple",
    adresse: "1 rue ...",
    cp: "51000",
    ville: "Ville",
    email: "",
    modeReglement: "",
  },
```

**Nouveau service** — demander libellé, unité (heure, lot, unité…) et prix HT, puis ajouter :

- dans `data/produits.js` : `{ id: "prod-xxx", code: "AR000NN", categorie, description, unite }`
  (code = suivant libre)
- dans `data/tarifs.js` : `{ produitId: "prod-xxx", prixUnitaireHT: 0.00 }`
  (+ `prixUnitaireHTFranchise` si le tarif auto-entrepreneur diffère)

Taux horaire actuel : **55 € HT** pour tous les services à l'heure.

## 3. Générer

```bash
python .claude/skills/facture/generer_facture.py --client 2BPOGNY --ligne "AR00014|Travaux design — dépliant|2" --ligne "AR00020|Impression 1000 dépliants|1"
```

| Option | Rôle | Défaut |
| --- | --- | --- |
| `--type` | `facture` ou `devis` | `facture` |
| `--client` | code client | requis |
| `--ligne` | `CODE\|Description\|Qté[\|PU]`, répétable | requis |
| `--date` | date ISO | aujourd'hui |
| `--numero` | suffixe 4 chiffres | suivant libre |
| `--regime` | `standard` ou `franchise-en-base` | `standard` (TVA 20 %) |
| `--reglement` | mode de règlement | `Virement bancaire` |

Le PU vient de `data/tarifs.js` ; ne le passer dans `--ligne` que pour un tarif
exceptionnel. Échéance, totaux, TVA et mentions légales sont calculés par l'application.
Plusieurs établissements (ex. 2BPOGNY et 2BSTM) = une commande par client.

## 4. Rendre le résultat

Le script affiche le chemin du PDF et une ligne récap. Envoyer le(s) PDF avec
SendUserFile et résumer : numéro, client, lignes, total TTC.

Sortie : `output/pdf/FA2026XXXX_<CLIENT>.pdf` (factures) ou `DV2026XXXX_…` (devis),
séries de numéros distinctes. Rendu identique au bouton « Télécharger en PDF »
(Chromium headless + html2pdf depuis un CDN : connexion internet requise).
