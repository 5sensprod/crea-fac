// Rôle : règles pures liées au régime de TVA et aux mentions de franchise.
export const REGIMES_TVA = Object.freeze({
  STANDARD: 'standard',
  FRANCHISE_EN_BASE: 'franchise-en-base'
});

export function normaliserRegimeTva(value){
  return value === REGIMES_TVA.FRANCHISE_EN_BASE
    ? REGIMES_TVA.FRANCHISE_EN_BASE
    : REGIMES_TVA.STANDARD;
}

export function estTvaApplicable(regimeTva){
  return normaliserRegimeTva(regimeTva) === REGIMES_TVA.STANDARD;
}

export function resoudreMentionFranchiseTva(dateIso, mentions = []){
  const dateFacture = String(dateIso || '0000-01-01');

  return [...mentions]
    .filter(mention=>mention?.depuis && mention?.texte && mention.depuis <= dateFacture)
    .sort((a, b)=>b.depuis.localeCompare(a.depuis))[0]?.texte || '';
}

export function composerMentionsLegales(mentionGenerale, mentionFranchise){
  return [...new Set([mentionGenerale, mentionFranchise]
    .map(mention=>String(mention || '').trim())
    .filter(Boolean))]
    .join(' — ');
}
