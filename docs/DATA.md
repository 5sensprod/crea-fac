# Schéma des données

## `clients.js`

```js
{
  id: 'cli-001',       // identifiant stable interne
  code: '2BPOGNY',     // code affiché sur la facture
  nom: 'SAS 2B POGNY',
  adresse: 'Ctre Commercial Les crayères',
  cp: '51240',
  ville: 'Pogny',
  email: '',
  modeReglement: ''
}
```

## `produits.js`

```js
{
  id: 'prod-domaine-home-pizza',
  code: 'AR00004',
  description: 'Nom de domaine home-pizza.fr 1 an'
}
```

## `tarifs.js`

```js
{
  produitId: 'prod-domaine-home-pizza',
  prixUnitaireHT: 12.95
}
```

Les montants sont stockés en nombres JavaScript, en euros HT. Le format `12,95` est réservé à l'interface.

## `parametres.js`

Contient les informations société, banque, TVA par défaut, délai d'échéance, préfixe de facture et lignes initiales.
