# Changelog

## 0.1.0

- Refactorisation du fichier HTML autonome en projet statique modulaire.
- Extraction du CSS dans `css/`.
- Extraction du JavaScript dans `js/`.
- Ajout de données éditables dans `data/`.
- Ajout des sélecteurs clients et produits.
- Conservation des calculs HT, TVA et TTC, des dates, du logo personnalisé et de l'export PDF.

## 2026-07-02 — Correction interface

- Barre d'actions déplacée dans le flux de page avec `position: sticky` au lieu de `fixed`.
- Suppression du chevauchement avec le logo et l'en-tête de facture.

## 2026-07-02 — Ajustement barre d'actions

- Réorganisation de la barre d'actions dans une carte compacte et alignée.
- Séparation claire entre les sélecteurs client/produit et les actions impression/PDF.
- Ajout d'un comportement responsive pour les petits écrans.

## 2026-07-02 — Déplacement des commandes du logo

- Déplacement des commandes d'import et de réinitialisation du logo dans la barre d'actions.
- Nettoyage de l'en-tête de facture : le logo reste seul dans la zone imprimable.
- Harmonisation visuelle des boutons du logo avec les autres commandes.

## 2026-07-10 — Régime TVA

- Ajout des régimes `standard` et `franchise-en-base`.
- Remplacement des anciens sélecteurs `#mentionFranchiseTva` et `#totalTtcLabel`.
- Réutilisation de `#mentionsLegales` pour la mention fiscale exportée.
- Masquage de `#ligneTva` et `#ligneTotalTtc` en franchise.
- Renommage dynamique de « Montant HT » et « Total HT ».
- Ajout de `composerMentionsLegales()` dans `core/regimeTva.js`.
- Ajout des mentions fiscales datées dans les paramètres.
- Libellé du sélecteur corrigé en « Franchise en base de TVA — sans TVA ».
- Ajout d'un badge d'état `#statutTva` dans la barre d'outils.
- Documentation clarifiée sur la séparation entre forme juridique et régime TVA.
- Ajout de tests automatisés sur les calculs, les mentions et les sélecteurs DOM.

## 2026-07-10 — Catalogue de services et taux horaires

- Remplacement des prestations figées par des catégories de services génériques.
- Ajout du champ `categorie` dans les produits.
- Ajout du champ `unite` dans les produits.
- Ajout de la saisie d'une description complémentaire avant insertion d'une ligne.
- Construction de la description finale à partir du libellé générique et de la description complémentaire.
- Ajout de l'identifiant DOM `#produitDescriptionInput`.
- Interprétation de `prixUnitaireHT` comme taux horaire pour les services dont l'unité est `heure`.
- Conservation des taux horaires dans `data/tarifs.js`.
- Prise en charge des quantités horaires décimales, par exemple `1,50`.
- Conservation du calcul générique `quantité × prixUnitaireHT`.
- Documentation mise à jour dans `ARCHITECTURE.md`, `CONVENTIONS.md`, `DATA.md` et `README.md`.

## 2026-07-10 — Données clients

- Ajout du client SARL Galichet.
- Conservation d'identifiants clients stables et indépendants du code affiché.
