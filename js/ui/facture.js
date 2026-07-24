// Rôle : rendu DOM de la facture, édition des lignes, dates, logo et conversions export.
import {
  calculerMontantHT,
  calculerTotaux,
  formatNum,
  parseNum,
} from "../core/calculs.js";
import {
  REGIMES_TVA,
  composerMentionsLegales,
  normaliserRegimeTva,
  resoudreMentionFranchiseTva,
} from "../core/regimeTva.js";
import {
  composerNumeroFacture,
  creerPrefixeFacture,
  limiterSuffixe,
  normaliserSuffixe,
} from "../core/numerotation.js";

import {
  parametresFactureTva,
  parametresMentionsLegales,
} from "../../data/parametres.js";

function $(selector, root = document) {
  return root.querySelector(selector);
}

function setValue(selector, value) {
  const el = $(selector);
  if (el) el.value = value ?? "";
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysISO(iso, days) {
  const date = new Date(iso);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function createInput({ type = "text", className = "", value = "" } = {}) {
  const input = document.createElement("input");
  input.type = type;
  input.value = value;
  if (className) input.className = className;
  return input;
}

function createCell(className, child) {
  const td = document.createElement("td");
  if (className) td.className = className;
  td.appendChild(child);
  return td;
}

export function initFacture({ parametres, produits, tarifs, store }) {
  const tbody = $("#linesTable tbody");
  const tvaInput = $("#tvaRate");
  const remiseGlobalePctInput = $("#remiseGlobalePct");
  const remiseGlobaleMontantInput = $("#remiseGlobaleMontant");
  const ligneRemiseGlobale = $("#ligneRemiseGlobale");
  const totalRemiseGlobale = $("#totalRemiseGlobale");
  const regimeTvaSelect = $("#regimeTvaSelect");
  const montantHtLabel = $("#montantHtLabel");
  const totalHtLabel = $("#totalHtLabel");
  const ligneTva = $("#ligneTva");
  const ligneTotalTtc = $("#ligneTotalTtc");
  const mentionsLegalesInput = $("#mentionsLegales");
  const statutTva = $("#statutTva");
  const numeroSuffix = $("#numeroSuffix");
  const numPrefix = $("#numPrefix");
  const dateFacture = $("#dateFactureInput");
  const dateEcheance = $("#dateEcheanceInput");
  const dateEcheanceRecap = $("#dateEcheanceRecap");
  let tauxTvaStandard = String(parametres.facture.tvaDefaut);

  function getRegimeTva() {
    return normaliserRegimeTva(
      regimeTvaSelect?.value || parametres.facture.regimeTvaDefaut,
    );
  }

  function mettreAJourMentionsLegales() {
    if (!mentionsLegalesInput) return;

    const sansTva = getRegimeTva() === REGIMES_TVA.FRANCHISE_EN_BASE;

    const mentionTva = sansTva
      ? resoudreMentionFranchiseTva(
          dateFacture.value,
          parametresFactureTva.mentionsFranchiseTva,
        )
      : "";

    mentionsLegalesInput.value = [
      mentionTva,
      ...parametresMentionsLegales.permanentes,
    ]
      .filter(Boolean)
      .join("\n");
  }

  function appliquerRegimeTva({ sauvegarder = true } = {}) {
    const regimeTva = getRegimeTva();
    const sansTva = regimeTva === REGIMES_TVA.FRANCHISE_EN_BASE;

    if (sansTva) {
      if (tvaInput.value !== "0") tauxTvaStandard = tvaInput.value;
      tvaInput.value = "0";
    } else if (tvaInput.value === "0") {
      tvaInput.value = tauxTvaStandard;
    }

    tvaInput.disabled = sansTva;

    if (montantHtLabel) {
      montantHtLabel.textContent = sansTva ? "Montant" : "Montant HT";
    }
    if (totalHtLabel) {
      totalHtLabel.textContent = sansTva ? "Total" : "Total HT";
    }
    if (ligneTva) {
      ligneTva.hidden = sansTva;
    }
    if (ligneTotalTtc) {
      ligneTotalTtc.hidden = sansTva;
    }
    if (statutTva) {
      statutTva.hidden = !sansTva;
    }

    mettreAJourMentionsLegales();
    if (sauvegarder) store.saveRegimeTva(regimeTva);
    calc();
  }

  function hydrateParametres() {
    setValue("#societeNom", parametres.societe.nom);
    setValue("#societeAdresse", parametres.societe.adresse);
    setValue(
      "#societeVille",
      `${parametres.societe.cp} ${parametres.societe.ville}`,
    );
    setValue(
      "#societeTelephone",
      `Tél portable : ${parametres.societe.telephone}`,
    );
    setValue("#societeSite", `Site web : ${parametres.societe.site}`);
    setValue("#societeEmail", `Email : ${parametres.societe.email}`);
    setValue("#banqueTitulaire", parametres.banque.titulaire);
    setValue("#banqueIban", `IBAN : ${parametres.banque.iban}`);
    setValue("#mentionsLegales", parametres.mentionsLegales);
    setValue("#reglementInput", parametres.facture.modeReglementDefaut);
    setValue("#echeanceMode", parametres.facture.modeReglementDefaut);

    tvaInput.value = String(parametres.facture.tvaDefaut);
    tauxTvaStandard = tvaInput.value;
    if (regimeTvaSelect) {
      regimeTvaSelect.value = normaliserRegimeTva(
        store.getRegimeTva() || parametres.facture.regimeTvaDefaut,
      );
    }
    numPrefix.textContent = creerPrefixeFacture({
      prefixe: parametres.facture.prefixeNumero,
    });
    numeroSuffix.value = normaliserSuffixe(
      store.getNumeroSuffixe() || parametres.facture.suffixeNumeroDefaut,
    );

    dateFacture.value = todayISO();
    updateEcheance();
  }

  function hydrateLogo() {
    const logoDataUrl = store.getLogoDataUrl();
    if (logoDataUrl) afficherLogoCustom(logoDataUrl);
  }

  function trouverProduit(produitId) {
    return produits.find((produit) => produit.id === produitId);
  }

  function trouverTarif(produitId) {
    return tarifs.find((tarif) => tarif.produitId === produitId);
  }

  function creerLigne(ligne = {}) {
    const tr = document.createElement("tr");
    const codeInput = createInput({ value: ligne.code || "" });
    const descInput = createInput({ value: ligne.description || "" });
    const qteInput = createInput({
      className: "qte",
      value: ligne.qte ?? "0,00",
    });
    const puInput = createInput({
      className: "pu",
      value: ligne.prixUnitaire ?? "0,00",
    });
    const remisePctInput = createInput({
      className: "remise-pct",
      value: ligne.remisePct ?? "0",
    });
    const remiseMontantInput = createInput({
      className: "remise-montant",
      value: ligne.remiseMontant ?? "0,00",
    });
    const montantSpan = document.createElement("span");
    const delButton = document.createElement("button");

    montantSpan.className = "montant-val";
    montantSpan.textContent = "0,00";

    delButton.type = "button";
    delButton.className = "del-btn";
    delButton.title = "Supprimer la ligne";
    delButton.textContent = "✕";
    delButton.addEventListener("click", () => {
      tr.remove();
      calc();
    });

    qteInput.addEventListener("input", calc);
    puInput.addEventListener("input", calc);
    remisePctInput.addEventListener("input", calc);
    remiseMontantInput.addEventListener("input", calc);

    tr.append(
      createCell("code", codeInput),
      createCell("desc", descInput),
      createCell("num", qteInput),
      createCell("num", puInput),
      createCell("num", remisePctInput),
      createCell("num", remiseMontantInput),
      createCell("num montant", montantSpan),
      createCell("no-export", delButton),
    );

    return tr;
  }

  function addRow(ligne = {}) {
    tbody.appendChild(creerLigne(ligne));
    calc();
  }

  function addEmptyRow() {
    addRow({ qte: "0,00", prixUnitaire: "0,00" });
  }

  function addProduit(produitId, descriptionComplementaire = "", qte = 1) {
    const produit = trouverProduit(produitId);

    if (!produit) return;

    const tarif = trouverTarif(produitId);

    const description = [produit.description, descriptionComplementaire]
      .map((valeur) => String(valeur || "").trim())
      .filter(Boolean)
      .join(" — ");

    addRow({
      code: produit.code,
      description,
      qte: formatNum(qte),
      prixUnitaire: formatNum(tarif?.prixUnitaireHT ?? 0),
    });
  }

  function calc() {
    const lignes = [];

    document.querySelectorAll("#linesTable tbody tr").forEach((row) => {
      const qteInput = row.querySelector(".qte");
      const puInput = row.querySelector(".pu");
      const remisePctInput = row.querySelector(".remise-pct");
      const remiseMontantInput = row.querySelector(".remise-montant");
      const montantSpan = row.querySelector(".montant-val");
      if (!qteInput || !puInput || !montantSpan) return;

      const ligne = {
        qte: qteInput.value,
        prixUnitaire: puInput.value,
        remisePct: remisePctInput?.value ?? 0,
        remiseMontant: remiseMontantInput?.value ?? 0,
      };

      lignes.push(ligne);
      montantSpan.textContent = formatNum(
        calculerMontantHT(
          ligne.qte,
          ligne.prixUnitaire,
          ligne.remisePct,
          ligne.remiseMontant,
        ),
      );
    });

    const remiseGlobale = {
      pct: remiseGlobalePctInput?.value ?? 0,
      montant: remiseGlobaleMontantInput?.value ?? 0,
    };
    const totaux = calculerTotaux(
      lignes,
      tvaInput.value,
      getRegimeTva(),
      remiseGlobale,
    );

    if (ligneRemiseGlobale) {
      ligneRemiseGlobale.hidden = totaux.remiseGlobaleValeur <= 0;
    }
    if (totalRemiseGlobale) {
      totalRemiseGlobale.textContent = formatNum(totaux.remiseGlobaleValeur);
    }
    $("#totalHT").textContent = formatNum(totaux.totalHT);
    $("#totalTVA").textContent = formatNum(totaux.totalTVA);
    $("#totalTTC").textContent = formatNum(totaux.totalTTC);
    $("#netAPayer").textContent = `${formatNum(totaux.totalTTC)} €`;
    $("#echeanceMontant").value = formatNum(totaux.totalTTC);
  }

  function setClient(client) {
    if (!client) return;
    setValue("#clientNom", client.nom);
    setValue("#clientAdresse", client.adresse);
    setValue("#clientVille", `${client.cp} ${client.ville}`);
    setValue("#codeClientInput", client.code || client.id);
    if (client.modeReglement) setValue("#reglementInput", client.modeReglement);
    if (client.modeReglement) setValue("#echeanceMode", client.modeReglement);
  }

  function updateEcheance() {
    if (!dateFacture.value) return;
    const iso = addDaysISO(
      dateFacture.value,
      parametres.facture.delaiEcheanceJours,
    );
    dateEcheance.value = iso;
    if (dateEcheanceRecap) dateEcheanceRecap.value = iso;
  }

  function afficherLogoCustom(src) {
    const img = $("#logoCustom");
    img.src = src;
    img.style.display = "inline-block";
    $("#logoDefault").style.display = "none";
  }

  function resetLogo() {
    const img = $("#logoCustom");
    img.style.display = "none";
    img.src = "";
    $("#logoDefault").style.display = "inline-block";
    store.clearLogoDataUrl();
  }

  function handleLogo(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const logoDataUrl = ev.target.result;
      afficherLogoCustom(logoDataUrl);
      store.saveLogoDataUrl(logoDataUrl);
    };
    reader.readAsDataURL(file);
  }

  function convertDatesForExport() {
    document.querySelectorAll('input[type="date"]').forEach((input) => {
      const iso = input.value;
      input.dataset.isoValue = iso;
      input.type = "text";
      if (iso) {
        const [year, month, day] = iso.split("-");
        input.value = `${day}/${month}/${year}`;
      }
      input.style.textAlign = "center";
    });
  }

  function restoreDatesAfterExport() {
    document.querySelectorAll("input[data-iso-value]").forEach((input) => {
      input.type = "date";
      input.value = input.dataset.isoValue;
      input.style.textAlign = "";
      delete input.dataset.isoValue;
    });
  }

  function convertInputsToText() {
    document.querySelectorAll('.page input[type="text"]').forEach((input) => {
      const span = document.createElement("span");
      const computedStyle = window.getComputedStyle(input);
      const isInline = input.classList.contains("no-convert");

      span.className = "export-text";
      span.textContent = input.value;
      span.style.textAlign = input.style.textAlign || computedStyle.textAlign;

      if (isInline) {
        span.style.display = "inline";
        span.style.whiteSpace = "nowrap";
        span.style.padding = "0";
      } else {
        span.style.display = "block";
        span.style.width = "100%";
        span.style.whiteSpace = "normal";
        span.style.wordBreak = "break-word";
        span.style.padding = "2px";
        span.style.minHeight = "18px";
      }

      input.style.display = "none";
      input.parentNode.insertBefore(span, input.nextSibling);
    });
  }

  function restoreInputsFromText() {
    document
      .querySelectorAll(".page span.export-text")
      .forEach((span) => span.remove());
    document.querySelectorAll('.page input[type="text"]').forEach((input) => {
      input.style.display = "";
    });
  }

  function masquerColonneRemiseSiVide({ inputSelector, colSelector, index }) {
    const remiseExiste = Array.from(
      document.querySelectorAll(`#linesTable tbody ${inputSelector}`),
    ).some((input) => Math.abs(parseNum(input.value)) > 0);

    if (remiseExiste) return;

    document
      .querySelectorAll(
        `#linesTable ${colSelector}, #linesTable thead th:nth-child(${index}), #linesTable tbody td:nth-child(${index})`,
      )
      .forEach((element) => {
        element.dataset.exportPreviousDisplay = element.style.display;
        element.dataset.exportHiddenDiscountColumn = "true";
        element.style.display = "none";
      });
  }

  function masquerColonnesRemiseVides() {
    masquerColonneRemiseSiVide({
      inputSelector: ".remise-pct",
      colSelector: "col.c-remise-pct",
      index: 5,
    });
    masquerColonneRemiseSiVide({
      inputSelector: ".remise-montant",
      colSelector: "col.c-remise-montant",
      index: 6,
    });
  }

  function restaurerColonnesRemise() {
    document
      .querySelectorAll('[data-export-hidden-discount-column="true"]')
      .forEach((element) => {
        element.style.display = element.dataset.exportPreviousDisplay || "";
        delete element.dataset.exportPreviousDisplay;
        delete element.dataset.exportHiddenDiscountColumn;
      });
  }

  function beforeExport({ masquerRemisesVides = false } = {}) {
    if (masquerRemisesVides) masquerColonnesRemiseVides();
    convertDatesForExport();
    convertInputsToText();
  }

  function afterExport() {
    restoreInputsFromText();
    restoreDatesAfterExport();
    restaurerColonnesRemise();
  }

  function getNumeroComplet() {
    return composerNumeroFacture(numPrefix.textContent, numeroSuffix.value);
  }

  $("#addEmptyLineBtn").addEventListener("click", addEmptyRow);
  $("#logoFile").addEventListener("change", handleLogo);
  $("#resetLogoBtn").addEventListener("click", resetLogo);
  tvaInput.addEventListener("input", function () {
    tauxTvaStandard = this.value;
    calc();
  });
  remiseGlobalePctInput?.addEventListener("input", calc);
  remiseGlobaleMontantInput?.addEventListener("input", calc);
  regimeTvaSelect?.addEventListener("change", () => appliquerRegimeTva());
  numeroSuffix.addEventListener("input", function () {
    this.value = limiterSuffixe(this.value);
    store.saveNumeroSuffixe(this.value);
  });
  numeroSuffix.addEventListener("blur", function () {
    this.value = normaliserSuffixe(this.value);
    store.saveNumeroSuffixe(this.value);
  });
  dateFacture.addEventListener("change", function () {
    updateEcheance();
    mettreAJourMentionsLegales();
  });
  dateEcheance.addEventListener("change", function () {
    if (dateEcheanceRecap) dateEcheanceRecap.value = this.value;
  });
  dateEcheanceRecap.addEventListener("change", function () {
    dateEcheance.value = this.value;
  });

  hydrateParametres();
  appliquerRegimeTva({ sauvegarder: false });
  hydrateLogo();

  tbody.innerHTML = "";
  parametres.facture.lignesInitiales.forEach((ligne) => {
    const produit = trouverProduit(ligne.produitId);
    const tarif = trouverTarif(ligne.produitId);
    addRow({
      code: produit?.code || "",
      description: produit?.description || "",
      qte: formatNum(ligne.qte ?? 1),
      prixUnitaire: formatNum(tarif?.prixUnitaireHT ?? 0),
    });
  });

  calc();

  return {
    addProduit,
    setClient,
    calc,
    beforeExport,
    afterExport,
    getNumeroComplet,
  };
}
