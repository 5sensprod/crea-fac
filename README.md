# CreaFAC

Générateur de factures statique, sans build, basé sur HTML/CSS/JavaScript vanilla.

## Lancer le projet

Méthode recommandée : ouvrir le dossier dans VS Code, puis lancer `index.html` avec l'extension **Live Server**.

Alternative en terminal :

```bash
npx serve .
```

Puis ouvrir l'URL locale indiquée par l'outil.

> Note : les modules JavaScript ES (`import/export`) sont plus fiables via un serveur local. Le double-clic sur `index.html` peut être bloqué par certains navigateurs.

## Modifier les données

- Clients : `data/clients.js`
- Produits : `data/produits.js`
- Tarifs : `data/tarifs.js`
- Paramètres société/facture : `data/parametres.js`

## Organisation

- `index.html` : structure HTML de la facture.
- `css/` : styles écran, facture et impression/PDF.
- `js/core/` : calculs purs et numérotation.
- `js/ui/` : DOM, sélecteurs, logo, export PDF.
- `js/store.js` : persistance locale via `localStorage`.
- `data/` : données métier éditables.
- `docs/` : documentation technique courte.
