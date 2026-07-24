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

// Applique une remise en pourcentage puis une remise en montant fixe sur une base HT.
// Ordre : base × (1 − remisePct/100) − remiseMontant. Le résultat ne descend jamais sous 0.
export function appliquerRemise(baseHT, remisePct, remiseMontant){
  const base = parseNum(baseHT);
  const pct = parseNum(remisePct);
  const montant = parseNum(remiseMontant);
  const apresPct = base * (1 - pct / 100);
  return Math.max(0, apresPct - montant);
}

// Montant net d'une ligne : quantité × prix unitaire, puis remise de ligne.
export function calculerMontantHT(qte, prixUnitaire, remisePct = 0, remiseMontant = 0){
  const brut = parseNum(qte) * parseNum(prixUnitaire);
  return appliquerRemise(brut, remisePct, remiseMontant);
}

// remiseGlobale : { pct, montant } appliquée sur le total HT des lignes.
export function calculerTotaux(lignes, tauxTva, regimeTva, remiseGlobale = {}){
  const totalHTBrut = lignes.reduce((total, ligne)=>{
    return total + calculerMontantHT(
      ligne.qte,
      ligne.prixUnitaire,
      ligne.remisePct,
      ligne.remiseMontant,
    );
  }, 0);

  const totalHT = appliquerRemise(
    totalHTBrut,
    remiseGlobale.pct,
    remiseGlobale.montant,
  );
  const remiseGlobaleValeur = totalHTBrut - totalHT;

  const tauxTvaEffectif = estTvaApplicable(regimeTva) ? parseNum(tauxTva) : 0;
  const totalTVA = totalHT * (tauxTvaEffectif / 100);
  const totalTTC = totalHT + totalTVA;

  return { totalHTBrut, totalHT, totalTVA, totalTTC, tauxTvaEffectif, remiseGlobaleValeur };
}
