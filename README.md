# CreaFAC

Générateur de factures statique, sans build, basé sur HTML, CSS et JavaScript vanilla.

## Fonctionnalités

- sélection d'un client ;
- sélection d'une catégorie de service ;
- ajout d'une description complémentaire ;
- calcul automatique des lignes ;
- prise en charge des quantités horaires décimales ;
- tarifs configurables dans les données ;
- régime TVA standard ou franchise en base ;
- mentions légales dynamiques ;
- aperçu, impression et export PDF ;
- logo personnalisable ;
- persistance locale des préférences prévues par l'application.

## Lancer le projet

Méthode recommandée : ouvrir le dossier dans VS Code, puis lancer `index.html` avec l'extension **Live Server**.

Alternative en terminal :

```bash
npx serve .
```

Puis ouvrir l'URL locale indiquée par l'outil.

> Les modules JavaScript ES (`import/export`) sont plus fiables via un serveur local. Le double-clic sur `index.html` peut être bloqué par certains navigateurs.

## Modifier les données

- Clients : `data/clients.js`
- Catégories de services : `data/produits.js`
- Tarifs et taux horaires : `data/tarifs.js`
- Paramètres société, facture et TVA : `data/parametres.js`

## Ajouter un client

Ajouter un objet à `data/clients.js` :

```js
{
  id: 'cli-002',
  code: 'GALICHET',
  nom: 'SARL Galichet',
  adresse: '4 rue Lochet',
  cp: '51000',
  ville: 'Châlons-en-Champagne',
  email: '',
  modeReglement: ''
}
```

Chaque client doit posséder un `id` unique et stable.

## Ajouter une catégorie de service

Ajouter un objet dans `data/produits.js` :

```js
{
  id: 'service-developpement',
  code: 'AR00001',
  categorie: 'Développement',
  description: 'Développement',
  unite: 'heure'
}
```

Puis ajouter son tarif dans `data/tarifs.js` :

```js
{
  produitId: 'service-developpement',
  prixUnitaireHT: 49
}
```

`produitId` doit correspondre exactement à l'`id` du produit.

## Ajouter un service à une facture

1. Sélectionner une catégorie de service.
2. Saisir une description complémentaire, par exemple `PocketConnect`.
3. Cliquer sur **Ajouter**.
4. Saisir le nombre d'heures dans la colonne quantité.
5. Ajuster la description ou le prix directement dans la ligne si nécessaire.

Exemple :

```text
Code : AR00001
Description : Développement — PocketConnect
Quantité : 1,50
Taux horaire HT : 49,00 €
Montant : 73,50 €
```

Le montant est calculé ainsi :

```text
1,50 × 49,00 € = 73,50 €
```

## Taux horaires

Pour un produit ayant :

```js
unite: 'heure'
```

la propriété :

```js
prixUnitaireHT
```

représente le taux horaire HT.

Le taux horaire reste dans `data/tarifs.js`. Il ne doit pas être codé en dur dans l'interface.

## Régime TVA

Le sélecteur propose deux valeurs internes :

```text
standard
franchise-en-base
```

### TVA applicable

En régime `standard` :

- le taux de TVA est appliqué ;
- les lignes Total HT, TVA et Total TTC sont visibles ;
- le net à payer correspond au total TTC.

### Franchise en base de TVA

En régime `franchise-en-base` :

- le taux de TVA effectif est nul ;
- les lignes TVA et Total TTC sont masquées ;
- « Montant HT » devient « Montant » ;
- « Total HT » devient « Total » ;
- une mention fiscale est ajoutée aux mentions légales ;
- le badge **Sans TVA** est affiché dans la barre d'outils.

Le régime TVA est indépendant de la forme juridique de l'entreprise.

## Mentions légales

Les mentions générales restent dans les paramètres.

La mention de franchise de TVA est sélectionnée automatiquement à partir de la date de facture dans :

```js
parametresFactureTva.mentionsFranchiseTva
```

Toutes les mentions sont composées dans l'élément :

```text
#mentionsLegales
```

Cet élément est inclus dans l'impression et dans le PDF.

## Organisation

- `index.html` : structure HTML de la facture ;
- `css/base.css` : styles globaux ;
- `css/facture.css` : styles écran et facture ;
- `css/print.css` : règles d'impression et d'export ;
- `js/core/` : calculs purs, numérotation et règles fiscales ;
- `js/ui/` : DOM, sélecteurs, lignes, logo et export PDF ;
- `js/store.js` : persistance locale via `localStorage` ;
- `data/` : données métier éditables ;
- `docs/` : documentation technique courte.

## Identifiants DOM importants

### Services

```text
produitSelect
produitDescriptionInput
addProductBtn
```

### TVA

```text
regimeTvaSelect
statutTva
montantHtLabel
totalHtLabel
ligneTva
ligneTotalTtc
mentionsLegales
```

## Principes de maintenance

- Ne pas placer les données métier dans le HTML.
- Ne pas placer les calculs dans les modules UI.
- Ne pas accéder directement à `localStorage` hors de `store.js`.
- Ne pas lier automatiquement la forme juridique au régime TVA.
- Ne pas créer un produit de référence pour chaque mission.
- Utiliser une catégorie générique et une description complémentaire.
- Conserver les taux horaires dans `data/tarifs.js`.
