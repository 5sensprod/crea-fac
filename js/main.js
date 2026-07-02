// Rôle : point d'entrée, assemblage des données, de l'UI et des actions.
import { clients } from '../data/clients.js';
import { produits } from '../data/produits.js';
import { tarifs } from '../data/tarifs.js';
import { parametres } from '../data/parametres.js';
import * as store from './store.js';
import { initFacture } from './ui/facture.js';
import { initPdfActions } from './ui/pdf.js';
import { initSelecteurs } from './ui/selecteurs.js';

const facture = initFacture({ parametres, produits, tarifs, store });

initSelecteurs({
  clients,
  produits,
  onClientSelect: facture.setClient,
  onProduitAdd: facture.addProduit
});

initPdfActions({
  getNumeroComplet: facture.getNumeroComplet,
  beforeExport: facture.beforeExport,
  afterExport: facture.afterExport
});
