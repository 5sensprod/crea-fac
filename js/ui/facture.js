// Rôle : rendu DOM de la facture, édition des lignes, dates, logo et conversions export.
import { calculerMontantHT, calculerTotaux, formatNum, parseNum } from '../core/calculs.js';
import { composerNumeroFacture, creerPrefixeFacture, limiterSuffixe, normaliserSuffixe } from '../core/numerotation.js';

function $(selector, root = document){
  return root.querySelector(selector);
}

function setValue(selector, value){
  const el = $(selector);
  if(el) el.value = value ?? '';
}

function todayISO(){
  return new Date().toISOString().slice(0, 10);
}

function addDaysISO(iso, days){
  const date = new Date(iso);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function createInput({ type = 'text', className = '', value = '' } = {}){
  const input = document.createElement('input');
  input.type = type;
  input.value = value;
  if(className) input.className = className;
  return input;
}

function createCell(className, child){
  const td = document.createElement('td');
  if(className) td.className = className;
  td.appendChild(child);
  return td;
}

export function initFacture({ parametres, produits, tarifs, store }){
  const tbody = $('#linesTable tbody');
  const tvaInput = $('#tvaRate');
  const numeroSuffix = $('#numeroSuffix');
  const numPrefix = $('#numPrefix');
  const dateFacture = $('#dateFactureInput');
  const dateEcheance = $('#dateEcheanceInput');
  const dateEcheanceRecap = $('#dateEcheanceRecap');

  function hydrateParametres(){
    setValue('#societeNom', parametres.societe.nom);
    setValue('#societeAdresse', parametres.societe.adresse);
    setValue('#societeVille', `${parametres.societe.cp} ${parametres.societe.ville}`);
    setValue('#societeTelephone', `Tél portable : ${parametres.societe.telephone}`);
    setValue('#societeSite', `Site web : ${parametres.societe.site}`);
    setValue('#societeEmail', `Email : ${parametres.societe.email}`);
    setValue('#banqueTitulaire', parametres.banque.titulaire);
    setValue('#banqueIban', `IBAN : ${parametres.banque.iban}`);
    setValue('#mentionsLegales', parametres.mentionsLegales);
    setValue('#reglementInput', parametres.facture.modeReglementDefaut);
    setValue('#echeanceMode', parametres.facture.modeReglementDefaut);

    tvaInput.value = String(parametres.facture.tvaDefaut);
    numPrefix.textContent = creerPrefixeFacture({ prefixe: parametres.facture.prefixeNumero });
    numeroSuffix.value = normaliserSuffixe(store.getNumeroSuffixe() || parametres.facture.suffixeNumeroDefaut);

    dateFacture.value = todayISO();
    updateEcheance();
  }

  function hydrateLogo(){
    const logoDataUrl = store.getLogoDataUrl();
    if(logoDataUrl) afficherLogoCustom(logoDataUrl);
  }

  function trouverProduit(produitId){
    return produits.find(produit => produit.id === produitId);
  }

  function trouverTarif(produitId){
    return tarifs.find(tarif => tarif.produitId === produitId);
  }

  function creerLigne(ligne = {}){
    const tr = document.createElement('tr');
    const codeInput = createInput({ value: ligne.code || '' });
    const descInput = createInput({ value: ligne.description || '' });
    const qteInput = createInput({ className: 'qte', value: ligne.qte ?? '0,00' });
    const puInput = createInput({ className: 'pu', value: ligne.prixUnitaire ?? '0,00' });
    const montantSpan = document.createElement('span');
    const delButton = document.createElement('button');

    montantSpan.className = 'montant-val';
    montantSpan.textContent = '0,00';

    delButton.type = 'button';
    delButton.className = 'del-btn';
    delButton.title = 'Supprimer la ligne';
    delButton.textContent = '✕';
    delButton.addEventListener('click', ()=>{
      tr.remove();
      calc();
    });

    qteInput.addEventListener('input', calc);
    puInput.addEventListener('input', calc);

    tr.append(
      createCell('code', codeInput),
      createCell('desc', descInput),
      createCell('num', qteInput),
      createCell('num', puInput),
      createCell('num montant', montantSpan),
      createCell('no-export', delButton)
    );

    return tr;
  }

  function addRow(ligne = {}){
    tbody.appendChild(creerLigne(ligne));
    calc();
  }

  function addEmptyRow(){
    addRow({ qte: '0,00', prixUnitaire: '0,00' });
  }

  function addProduit(produitId, qte = 1){
    const produit = trouverProduit(produitId);
    if(!produit) return;

    const tarif = trouverTarif(produitId);
    addRow({
      code: produit.code,
      description: produit.description,
      qte: formatNum(qte),
      prixUnitaire: formatNum(tarif?.prixUnitaireHT ?? 0)
    });
  }

  function getLignes(){
    return [...document.querySelectorAll('#linesTable tbody tr')].map(row=>({
      qte: row.querySelector('.qte')?.value || '0',
      prixUnitaire: row.querySelector('.pu')?.value || '0'
    }));
  }

  function calc(){
    let totalHT = 0;

    document.querySelectorAll('#linesTable tbody tr').forEach(row=>{
      const qteInput = row.querySelector('.qte');
      const puInput = row.querySelector('.pu');
      const montantSpan = row.querySelector('.montant-val');
      if(!qteInput || !puInput || !montantSpan) return;

      const montant = calculerMontantHT(qteInput.value, puInput.value);
      montantSpan.textContent = formatNum(montant);
      totalHT += montant;
    });

    const totaux = calculerTotaux(getLignes(), tvaInput.value);
    $('#totalHT').textContent = formatNum(totalHT);
    $('#totalTVA').textContent = formatNum(totaux.totalTVA);
    $('#totalTTC').textContent = formatNum(totaux.totalTTC);
    $('#netAPayer').textContent = `${formatNum(totaux.totalTTC)} €`;
    $('#echeanceMontant').value = formatNum(totaux.totalTTC);
  }

  function setClient(client){
    if(!client) return;
    setValue('#clientNom', client.nom);
    setValue('#clientAdresse', client.adresse);
    setValue('#clientVille', `${client.cp} ${client.ville}`);
    setValue('#codeClientInput', client.code || client.id);
    if(client.modeReglement) setValue('#reglementInput', client.modeReglement);
    if(client.modeReglement) setValue('#echeanceMode', client.modeReglement);
  }

  function updateEcheance(){
    if(!dateFacture.value) return;
    const iso = addDaysISO(dateFacture.value, parametres.facture.delaiEcheanceJours);
    dateEcheance.value = iso;
    if(dateEcheanceRecap) dateEcheanceRecap.value = iso;
  }

  function afficherLogoCustom(src){
    const img = $('#logoCustom');
    img.src = src;
    img.style.display = 'inline-block';
    $('#logoDefault').style.display = 'none';
  }

  function resetLogo(){
    const img = $('#logoCustom');
    img.style.display = 'none';
    img.src = '';
    $('#logoDefault').style.display = 'inline-block';
    store.clearLogoDataUrl();
  }

  function handleLogo(event){
    const file = event.target.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = ev=>{
      const logoDataUrl = ev.target.result;
      afficherLogoCustom(logoDataUrl);
      store.saveLogoDataUrl(logoDataUrl);
    };
    reader.readAsDataURL(file);
  }

  function convertDatesForExport(){
    document.querySelectorAll('input[type="date"]').forEach(input=>{
      const iso = input.value;
      input.dataset.isoValue = iso;
      input.type = 'text';
      if(iso){
        const [year, month, day] = iso.split('-');
        input.value = `${day}/${month}/${year}`;
      }
      input.style.textAlign = 'center';
    });
  }

  function restoreDatesAfterExport(){
    document.querySelectorAll('input[data-iso-value]').forEach(input=>{
      input.type = 'date';
      input.value = input.dataset.isoValue;
      input.style.textAlign = '';
      delete input.dataset.isoValue;
    });
  }

  function convertInputsToText(){
    document.querySelectorAll('.page input[type="text"]').forEach(input=>{
      const span = document.createElement('span');
      const computedStyle = window.getComputedStyle(input);
      const isInline = input.classList.contains('no-convert');

      span.className = 'export-text';
      span.textContent = input.value;
      span.style.textAlign = input.style.textAlign || computedStyle.textAlign;

      if(isInline){
        span.style.display = 'inline';
        span.style.whiteSpace = 'nowrap';
        span.style.padding = '0';
      }else{
        span.style.display = 'block';
        span.style.width = '100%';
        span.style.whiteSpace = 'normal';
        span.style.wordBreak = 'break-word';
        span.style.padding = '2px';
        span.style.minHeight = '18px';
      }

      input.style.display = 'none';
      input.parentNode.insertBefore(span, input.nextSibling);
    });
  }

  function restoreInputsFromText(){
    document.querySelectorAll('.page span.export-text').forEach(span=>span.remove());
    document.querySelectorAll('.page input[type="text"]').forEach(input=>{
      input.style.display = '';
    });
  }

  function beforeExport(){
    convertDatesForExport();
    convertInputsToText();
  }

  function afterExport(){
    restoreInputsFromText();
    restoreDatesAfterExport();
  }

  function getNumeroComplet(){
    return composerNumeroFacture(numPrefix.textContent, numeroSuffix.value);
  }

  $('#addEmptyLineBtn').addEventListener('click', addEmptyRow);
  $('#logoFile').addEventListener('change', handleLogo);
  $('#resetLogoBtn').addEventListener('click', resetLogo);
  tvaInput.addEventListener('input', calc);
  numeroSuffix.addEventListener('input', function(){
    this.value = limiterSuffixe(this.value);
    store.saveNumeroSuffixe(this.value);
  });
  numeroSuffix.addEventListener('blur', function(){
    this.value = normaliserSuffixe(this.value);
    store.saveNumeroSuffixe(this.value);
  });
  dateFacture.addEventListener('change', updateEcheance);
  dateEcheance.addEventListener('change', function(){
    if(dateEcheanceRecap) dateEcheanceRecap.value = this.value;
  });
  dateEcheanceRecap.addEventListener('change', function(){
    dateEcheance.value = this.value;
  });

  hydrateParametres();
  hydrateLogo();

  tbody.innerHTML = '';
  parametres.facture.lignesInitiales.forEach(ligne=>{
    const produit = trouverProduit(ligne.produitId);
    const tarif = trouverTarif(ligne.produitId);
    addRow({
      code: produit?.code || '',
      description: produit?.description || '',
      qte: formatNum(ligne.qte ?? 1),
      prixUnitaire: formatNum(tarif?.prixUnitaireHT ?? 0)
    });
  });

  calc();

  return {
    addProduit,
    setClient,
    calc,
    beforeExport,
    afterExport,
    getNumeroComplet
  };
}
