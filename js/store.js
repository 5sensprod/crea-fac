// Rôle : accès centralisé au localStorage pour éviter les appels directs dans l'UI.
const STORAGE_KEY = 'crea-fac.settings.v1';

function lire(){
  try{
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  }catch(_err){
    return {};
  }
}

function ecrire(settings){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function getSettings(){
  return lire();
}

export function patchSettings(partial){
  const next = { ...lire(), ...partial };
  ecrire(next);
  return next;
}

export function getLogoDataUrl(){
  return lire().logoDataUrl || '';
}

export function saveLogoDataUrl(logoDataUrl){
  patchSettings({ logoDataUrl });
}

export function clearLogoDataUrl(){
  const settings = lire();
  delete settings.logoDataUrl;
  ecrire(settings);
}

export function getNumeroSuffixe(){
  return lire().numeroSuffixe || '';
}

export function saveNumeroSuffixe(numeroSuffixe){
  patchSettings({ numeroSuffixe });
}

export function getRegimeTva(){
  return lire().regimeTva || '';
}

export function saveRegimeTva(regimeTva){
  patchSettings({ regimeTva });
}
