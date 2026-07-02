# Architecture

## Flux général

```text
data/*.js → js/main.js → js/ui/* → DOM → impression/PDF
                   ↓
              js/store.js
```

## Dossiers

### `data/`

Contient uniquement des objets JavaScript exportés. Ces fichiers remplacent les valeurs métier inscrites en dur dans l'ancien HTML : clients, produits, tarifs et paramètres.

### `js/core/`

Fonctions pures sans accès au DOM.

- `calculs.js` : parsing français, formatage, montants HT/TVA/TTC.
- `numerotation.js` : préfixe annuel, suffixe à quatre chiffres, numéro complet.

### `js/ui/`

Modules qui manipulent le DOM.

- `facture.js` : lignes, totaux, dates, client, logo, conversion export.
- `selecteurs.js` : listes déroulantes clients/produits.
- `pdf.js` : impression et export via html2pdf.

### `js/store.js`

Seul point d'accès au `localStorage`. Le reste du code ne lit ni n'écrit directement dans le stockage navigateur.

## Règle de séparation

- Une fonction dans `core/` ne doit jamais appeler `document`, `window`, `localStorage` ou `alert`.
- Une fonction dans `ui/` peut manipuler le DOM mais doit déléguer les calculs à `core/`.
- Une donnée de référence doit rester dans `data/`, pas dans le HTML.
