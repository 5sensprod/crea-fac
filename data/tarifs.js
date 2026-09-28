// Rôle : tarifs HT associés aux produits.
// prixUnitaireHT      : tarif du régime standard (TVA applicable).
// prixUnitaireHTFranchise : tarif appliqué en franchise en base (auto-entrepreneur),
//                           optionnel — à défaut, prixUnitaireHT est utilisé.
export const tarifs = [
  {
    produitId: "prod-domaine-home-pizza",
    prixUnitaireHT: 12.95,
  },
  {
    produitId: "prod-hebergement-ovh-performance",
    prixUnitaireHT: 25.07,
  },
  {
    produitId: "service-developpement",
    prixUnitaireHT: 55,
    prixUnitaireHTFranchise: 55,
  },
  {
    produitId: "service-modification-web",
    prixUnitaireHT: 55,
    prixUnitaireHTFranchise: 55,
  },
  {
    produitId: "service-communication-digitale",
    prixUnitaireHT: 55,
    prixUnitaireHTFranchise: 55,
  },
  {
    produitId: "service-graphisme",
    prixUnitaireHT: 55,
    prixUnitaireHTFranchise: 55,
  },
  {
    produitId: "service-audiovisuel",
    prixUnitaireHT: 55,
    prixUnitaireHTFranchise: 55,
  },
  {
    produitId: "service-animation",
    prixUnitaireHT: 55,
    prixUnitaireHTFranchise: 55,
  },
  {
    produitId: "prod-impression-depliants",
    prixUnitaireHT: 219.8,
  },
];
