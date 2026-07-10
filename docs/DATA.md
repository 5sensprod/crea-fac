# Schéma des données

## `clients.js`

Chaque client possède un identifiant interne stable.

```js
{
  id: 'cli-001',
  code: '2BPOGNY',
  nom: 'SAS 2B POGNY',
  adresse: 'Ctre Commercial Les crayères',
  cp: '51240',
  ville: 'Pogny',
  email: '',
  modeReglement: ''
}
```

Exemple avec un second client :

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

### Règles

- `id` est un identifiant interne stable.
- `code` est le code affiché sur la facture.
- `cp` reste une chaîne pour conserver les éventuels zéros initiaux.
- Les champs facultatifs utilisent une chaîne vide lorsqu'ils ne sont pas renseignés.

## `produits.js`

Un produit représente une catégorie de service réutilisable.

```js
{
  id: 'service-developpement',
  code: 'AR00001',
  categorie: 'Développement',
  description: 'Développement',
  unite: 'heure'
}
```

Autres exemples :

```js
{
  id: 'service-modification-web',
  code: 'AR00004',
  categorie: 'Web',
  description: 'Modification web',
  unite: 'heure'
}
```

```js
{
  id: 'service-graphisme',
  code: 'AR00014',
  categorie: 'Graphisme',
  description: 'Graphisme',
  unite: 'heure'
}
```

### Champs

- `id` : identifiant stable utilisé par les relations internes ;
- `code` : référence affichée sur la facture ;
- `categorie` : groupe métier du service ;
- `description` : libellé générique inséré dans la ligne ;
- `unite` : unité de quantité, par exemple `heure`, `jour`, `forfait` ou `unite`.

### Description complémentaire

La description propre à une mission n'est pas stockée dans `produits.js`.

Exemple :

```text
Produit : Développement
Description complémentaire : PocketConnect
Description de ligne : Développement — PocketConnect
```

La description finale reste modifiable directement dans la ligne de facture.

## `tarifs.js`

Chaque tarif référence un produit par son `id`.

```js
{
  produitId: 'service-developpement',
  prixUnitaireHT: 49
}
```

Pour un produit dont l'unité est `heure`, `prixUnitaireHT` représente le taux horaire HT.

Exemple complet :

```js
export const tarifs = [
  {
    produitId: 'service-developpement',
    prixUnitaireHT: 49
  },
  {
    produitId: 'service-modification-web',
    prixUnitaireHT: 49
  },
  {
    produitId: 'service-graphisme',
    prixUnitaireHT: 49
  }
];
```

### Calcul

```text
montant de ligne = quantité × prixUnitaireHT
```

Pour une prestation horaire :

```text
montant de ligne = nombre d'heures × taux horaire HT
```

Exemple :

```text
1,50 heure × 49,00 € = 73,50 €
```

Les montants et quantités sont stockés sous forme de nombres JavaScript. Les formats `1,50` et `49,00` sont réservés à l'interface.

## `parametres.js`

Le fichier contient les informations de société, les coordonnées bancaires, les paramètres de facture, le régime TVA par défaut et les mentions légales.

## Société

La forme juridique décrit l'entreprise, mais ne pilote pas directement la TVA.

```js
{
  formeJuridique: 'entreprise-individuelle'
}
```

Exemples possibles :

```text
entreprise-individuelle
micro-entreprise
sarl
sas
association
```

Les valeurs doivent être définies et documentées par l'application si elles sont exploitées dans le code.

## Paramètres de TVA

Structure existante recommandée :

```js
export const parametresFactureTva = {
  regimeTvaDefaut: 'standard',
  mentionsFranchiseTva: [
    {
      depuis: '0000-01-01',
      texte:
        'TVA non applicable, art. 293 B du code général des impôts.'
    },
    {
      depuis: '2026-09-01',
      texte:
        'TVA non applicable, art. L. 223 et s. du code des impositions sur les biens et services (CIBS).'
    }
  ]
};
```

Si le taux standard est géré dans le même objet :

```js
export const parametresFactureTva = {
  tvaDefaut: 20,
  regimeTvaDefaut: 'standard',
  mentionsFranchiseTva: [
    {
      depuis: '0000-01-01',
      texte:
        'TVA non applicable, art. 293 B du code général des impôts.'
    },
    {
      depuis: '2026-09-01',
      texte:
        'TVA non applicable, art. L. 223 et s. du code des impositions sur les biens et services (CIBS).'
    }
  ]
};
```

### Valeurs autorisées pour `regimeTvaDefaut`

#### `standard`

- la TVA est calculée avec `tvaDefaut` ;
- les lignes Total HT, TVA et Total TTC sont visibles ;
- aucune mention de franchise en base n'est ajoutée.

#### `franchise-en-base`

- le taux de TVA effectif est nul ;
- les lignes TVA et Total TTC sont masquées ;
- le total HT est présenté comme total ;
- la mention fiscale est résolue selon la date de facture.

## Mentions légales générales

Les mentions permanentes restent séparées de la mention TVA.

Exemple :

```js
export const parametresMentionsLegales = {
  permanentes: [
    "Dispensé d'immatriculation en application de l'article L.123-1-1 du code de commerce.",
    "En cas de retard de paiement, une pénalité égale à 3 fois le taux d'intérêt légal sera exigible (Décret 2009-138 du 9 février 2009).",
    "Pour les professionnels, une indemnité minimum forfaitaire de 40 euros pour frais de recouvrement sera exigible (Décret 2012-1115 du 9 octobre 2012).",
    "Pas d’escompte pour règlement par anticipation."
  ]
};
```

La mention TVA est ajoutée dynamiquement en première position lorsque le régime est `franchise-en-base`.

Résultat attendu :

```text
TVA non applicable, art. 293 B du code général des impôts.
Dispensé d'immatriculation en application de l'article L.123-1-1 du code de commerce.
En cas de retard de paiement, une pénalité égale à 3 fois le taux d'intérêt légal sera exigible (Décret 2009-138 du 9 février 2009).
Pour les professionnels, une indemnité minimum forfaitaire de 40 euros pour frais de recouvrement sera exigible (Décret 2012-1115 du 9 octobre 2012).
Pas d’escompte pour règlement par anticipation.
```

## Séparation obligatoire

La combinaison suivante est valide :

```js
{
  formeJuridique: 'micro-entreprise',
  regimeTvaDefaut: 'standard'
}
```

La combinaison suivante est également valide :

```js
{
  formeJuridique: 'entreprise-individuelle',
  regimeTvaDefaut: 'franchise-en-base'
}
```

Aucune dépendance automatique ne doit exister entre `formeJuridique` et `regimeTvaDefaut`.

## Relations entre les fichiers

```text
produits[].id
      ↓
tarifs[].produitId
```

Chaque `produitId` doit correspondre à un produit existant.

Exemple valide :

```js
// produits.js
{
  id: 'service-developpement',
  code: 'AR00001',
  description: 'Développement',
  unite: 'heure'
}

// tarifs.js
{
  produitId: 'service-developpement',
  prixUnitaireHT: 49
}
```
