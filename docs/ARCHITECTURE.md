# Architecture

## Flux général

```text
data/*.js → js/main.js → js/ui/* → DOM → impression/PDF
                   ↓          ↓
              js/store.js  js/core/*
```

## Responsabilités

### `data/`

Contient uniquement les données métier et les objets JavaScript de référence :

- `clients.js` : annuaire des clients ;
- `produits.js` : catalogue des catégories de services ;
- `tarifs.js` : prix unitaires ou taux horaires HT ;
- `parametres.js` : société, banque, facture, TVA, mentions légales et valeurs par défaut.

Les données de référence ne doivent pas être codées en dur dans le HTML ou dans les modules UI.

### `js/core/`

Contient les fonctions pures, sans accès au DOM, à `window`, à `localStorage` ou à `alert`.

- `calculs.js` : parsing français, formatage, calcul des montants HT, TVA, TTC et taux de TVA effectif ;
- `numerotation.js` : préfixe annuel, suffixe et numéro complet de facture ;
- `regimeTva.js` : normalisation du régime TVA, applicabilité de la TVA, résolution des mentions fiscales datées et composition des mentions légales.

Une fonction de `core/` reçoit des valeurs et retourne un résultat. Elle ne modifie jamais directement l'interface.

### `js/ui/`

Contient les modules qui manipulent le DOM et délèguent les règles métier à `core/`.

- `facture.js` : lignes de facture, descriptions, quantités, totaux, dates, client, logo, régime TVA, mentions légales et préparation de l'export ;
- `selecteurs.js` : sélection des clients et des catégories de services, saisie de la description complémentaire et transmission du service sélectionné à `facture.js` ;
- `pdf.js` : aperçu, impression et export avec `html2pdf`.

### `js/store.js`

Seul point d'accès au `localStorage`.

Il peut notamment persister :

- le régime TVA sélectionné ;
- le taux de TVA standard précédemment utilisé ;
- les préférences d'interface prévues par l'application.

Le reste du code ne lit ni n'écrit directement dans le stockage navigateur.

## Flux d'ajout d'un service

```text
data/produits.js + data/tarifs.js
                ↓
       js/ui/selecteurs.js
                ↓
catégorie sélectionnée + description complémentaire
                ↓
        js/ui/facture.js
                ↓
code + description finale + quantité + prix unitaire
                ↓
         js/core/calculs.js
                ↓
             montant
```

Le catalogue contient des catégories de services génériques.

Exemple :

```text
Catégorie : Développement
Description complémentaire : PocketConnect
Description de ligne : Développement — PocketConnect
```

La description propre à une mission appartient à la ligne de facture. Elle ne doit pas être enregistrée comme un nouveau produit de référence.

## Flux du calcul horaire

Pour un produit dont l'unité est `heure` :

```text
quantité saisie = nombre d'heures
prixUnitaireHT = taux horaire HT
montant de ligne = quantité × prixUnitaireHT
```

Exemple :

```text
1,50 heure × 49,00 € = 73,50 €
```

Le taux horaire reste dans `data/tarifs.js`. L'UI ne contient aucun tarif codé en dur.

## Flux du régime de TVA

```text
parametresFactureTva.regimeTvaDefaut
                    ↓
       regimeTvaSelect ↔ store.js
                    ↓
     core/calculs.js + core/regimeTva.js
                    ↓
libellés + lignes TVA/TTC + net à payer + mentionsLegales
```

### Régime `standard`

- le taux de TVA standard est appliqué ;
- les lignes Total HT, TVA et Total TTC sont visibles ;
- le taux reste modifiable si l'interface l'autorise.

### Régime `franchise-en-base`

- le taux de TVA effectif est forcé à zéro ;
- la ligne TVA est masquée ;
- la ligne Total TTC est masquée ;
- « Montant HT » devient « Montant » ;
- « Total HT » devient « Total » ;
- la mention fiscale correspondant à la date de facture est ajoutée à `#mentionsLegales`.

## Contrat DOM

Les identifiants suivants sont contractuels pour la fonctionnalité TVA :

- `regimeTvaSelect`
- `statutTva`
- `montantHtLabel`
- `totalHtLabel`
- `ligneTva`
- `ligneTotalTtc`
- `mentionsLegales`

Le champ suivant est contractuel pour la description complémentaire d'un service :

- `produitDescriptionInput`

Ne pas recréer les anciens identifiants :

- `mentionFranchiseTva`
- `totalTtcLabel`

## Invariants

- Une donnée de référence reste dans `data/`.
- Un calcul métier reste dans `js/core/`.
- Une manipulation du DOM reste dans `js/ui/`.
- Un accès au stockage reste dans `js/store.js`.
- La forme juridique et le régime de TVA sont deux notions indépendantes.
- Le régime TVA n'est jamais déduit automatiquement de la forme juridique.
- Les chaînes fiscales ne sont pas codées en dur dans l'UI.
- Le PDF n'applique aucune règle fiscale : il exporte le DOM déjà préparé.
- `#mentionsLegales` est l'unique sortie des mentions générales et fiscales.
- Le catalogue contient des catégories de services génériques.
- La description propre à une mission appartient à la ligne de facture.
- Le taux horaire reste dans `data/tarifs.js`.
- Le montant d'une ligne est calculé dans `core/calculs.js` à partir de la quantité et du prix unitaire HT.
