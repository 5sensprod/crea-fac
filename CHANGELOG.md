# Changelog

## 0.1.0

- Refactorisation du fichier HTML autonome en projet statique modulaire.
- Extraction du CSS dans `css/`.
- Extraction du JavaScript dans `js/`.
- Ajout de données éditables dans `data/`.
- Ajout des sélecteurs clients et produits.
- Conservation des calculs HT/TVA/TTC, des dates, du logo personnalisé et de l'export PDF.

## 2026-07-02 - Correction interface

- Barre d'actions déplacée dans le flux de page avec `position: sticky` au lieu de `fixed`.
- Suppression du chevauchement avec le logo et l'en-tête de facture.
## 2026-07-02 — Ajustement barre d’actions

- Réorganisation de la barre d’actions dans une carte compacte et alignée.
- Séparation claire entre les sélecteurs client/produit et les actions impression/PDF.
- Ajout d’un comportement responsive pour les petits écrans.

## 2026-07-02 — Déplacement commandes logo

- Déplacement des commandes d'import/réinitialisation du logo dans la barre d'actions.
- Nettoyage de l'en-tête de facture : le logo reste seul dans la zone imprimable.
- Harmonisation visuelle des boutons logo avec les autres commandes du menu.
