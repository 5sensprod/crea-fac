# Conventions

## Langue

Le nommage métier reste en français : `facture`, `echeance`, `produits`, `tarifs`, `montantHT`.

## JavaScript

- `camelCase` pour variables et fonctions.
- Un module = une responsabilité.
- Pas de gestionnaire inline dans le HTML (`onclick`, `oninput`, etc.).
- Les calculs restent dans `js/core/`.
- Les accès `localStorage` passent par `js/store.js`.

## CSS

- Variables globales dans `:root`.
- Classes en kebab-case.
- `.no-export` masque les éléments non imprimables.
- Pas de styles inline dans le HTML.

## Données

- Chaque client et produit a un `id` stable.
- Les prix sont stockés en nombres, pas en chaînes formatées.
- Le formatage monétaire est fait uniquement dans l'UI.
