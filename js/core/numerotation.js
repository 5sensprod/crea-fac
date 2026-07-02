// Rôle : génération et normalisation du numéro de facture.
export function creerPrefixeFacture({ prefixe = 'FA', date = new Date() } = {}){
  return `${prefixe}${date.getFullYear()}`;
}

export function normaliserSuffixe(value){
  return String(value ?? '')
    .replace(/\D/g, '')
    .padStart(4, '0')
    .slice(0, 4);
}

export function limiterSuffixe(value){
  return String(value ?? '').replace(/\D/g, '').slice(0, 4);
}

export function composerNumeroFacture(prefixe, suffixe){
  return `${prefixe}${normaliserSuffixe(suffixe)}`;
}
