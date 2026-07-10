// Rôle : fonctions pures de parsing, formatage et calcul des totaux de facture.
import { estTvaApplicable } from './regimeTva.js';
export function parseNum(str){
  if(!str) return 0;
  return parseFloat(String(str).replace(/\s/g,'').replace(',', '.').replace('€','')) || 0;
}

export function formatNum(n){
  return Number(n).toLocaleString('fr-FR', {
    minimumFractionDigits:2,
    maximumFractionDigits:2
  });
}

export function calculerMontantHT(qte, prixUnitaire){
  return parseNum(qte) * parseNum(prixUnitaire);
}

export function calculerTotaux(lignes, tauxTva, regimeTva){
  const totalHT = lignes.reduce((total, ligne)=>{
    return total + calculerMontantHT(ligne.qte, ligne.prixUnitaire);
  }, 0);

  const tauxTvaEffectif = estTvaApplicable(regimeTva) ? parseNum(tauxTva) : 0;
  const totalTVA = totalHT * (tauxTvaEffectif / 100);
  const totalTTC = totalHT + totalTVA;

  return { totalHT, totalTVA, totalTTC, tauxTvaEffectif };
}
