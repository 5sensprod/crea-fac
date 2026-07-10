# Conventions

## Langue et nommage

Le nommage métier reste en français :

- `facture`
- `echeance`
- `regimeTva`
- `montantHT`
- `prixUnitaireHT`
- `descriptionComplementaire`

Utiliser des noms explicites et cohérents avec le domaine de la facturation.

## JavaScript

- Utiliser `camelCase` pour les variables et les fonctions.
- Un module doit avoir une responsabilité principale.
- Aucun gestionnaire inline dans le HTML (`onclick`, `oninput`, etc.).
- Les calculs et règles fiscales restent dans `js/core/`.
- Les manipulations DOM restent dans `js/ui/`.
- Les accès `localStorage` passent uniquement par `js/store.js`.
- Les données de référence restent dans `data/`.
- Le régime TVA n'est pas un booléen : utiliser `standard` ou `franchise-en-base`.
- Ne pas utiliser `auto-entrepreneur` ou `micro-entreprise` comme identifiant de régime TVA.
- `formeJuridique` et `regimeTva` sont deux propriétés distinctes.
- Les chaînes fiscales ne sont jamais codées en dur dans `js/ui/`.
- Les tarifs ne sont jamais codés en dur dans l'interface.
- Les fonctions pures ne doivent appeler ni `document`, ni `window`, ni `localStorage`, ni `alert`.

## DOM

### Régime TVA

Identifiants contractuels :

- `regimeTvaSelect`
- `statutTva`
- `montantHtLabel`
- `totalHtLabel`
- `ligneTva`
- `ligneTotalTtc`
- `mentionsLegales`

Ne pas recréer les anciens identifiants :

- `mentionFranchiseTva`
- `totalTtcLabel`

### Sélection des services

Identifiants contractuels :

- `produitSelect`
- `produitDescriptionInput`
- `addProductBtn`

`produitDescriptionInput` contient uniquement la description complémentaire saisie pour la ligne en cours.

Exemple :

```text
Produit sélectionné : Développement
Description complémentaire : PocketConnect
Description finale : Développement — PocketConnect
```

## CSS

- Les variables globales restent dans `:root`.
- Les classes utilisent le format `kebab-case`.
- `.no-export` masque les commandes non imprimables.
- Aucun style inline dans le HTML.
- Les lignes de totaux sont masquées avec l'attribut `hidden`.
- Les éléments portant `[hidden]` doivent réellement être masqués par le CSS.
- Les styles d'impression restent dans `print.css`.
- Les styles propres à la facture restent dans `facture.css`.

## Données

- Chaque client possède un `id` stable.
- Chaque produit possède un `id` stable.
- `produitId` dans `tarifs.js` référence exactement un `id` de `produits.js`.
- Les prix sont stockés sous forme de nombres JavaScript.
- Les taux horaires sont stockés sous forme de nombres JavaScript.
- Le formatage monétaire est effectué uniquement dans l'UI.
- Le format français `1,50` est réservé à l'affichage et à la saisie.
- Un produit de référence peut définir `categorie` et `unite`.
- Pour `unite: 'heure'`, `prixUnitaireHT` représente le taux horaire HT.
- La description complémentaire saisie par l'utilisateur n'est pas enregistrée dans `produits.js`.
- La quantité accepte les décimales, par exemple `1,50`.
- Les changements de mention fiscale sont modélisés par `{ depuis, texte }`.

## Produits et services

Un produit de référence représente une catégorie de service réutilisable, et non nécessairement une mission complète.

Bon exemple :

```js
{
  id: 'service-developpement',
  code: 'AR00001',
  categorie: 'Développement',
  description: 'Développement',
  unite: 'heure'
}
```

À éviter :

```js
{
  id: 'pocket-connect-juillet-2026',
  code: 'AR00001',
  description: 'Développement PocketConnect juillet 2026'
}
```

La mission spécifique doit être ajoutée dans la description de la ligne.

## Calculs

Le calcul d'une ligne reste :

```text
quantité × prixUnitaireHT
```

Pour un service horaire :

```text
nombre d'heures × taux horaire HT
```

Exemple :

```text
1,50 × 49,00 = 73,50
```

Le calcul ne dépend pas du libellé affiché dans les colonnes.

## Mentions légales

- Les mentions générales restent dans les paramètres.
- La mention TVA est ajoutée uniquement lorsque le régime l'exige.
- La mention TVA applicable est résolue à partir de la date de facture.
- `#mentionsLegales` est le seul élément exporté contenant les mentions combinées.
- Une mention liée à la forme juridique ne doit pas être déclenchée par le régime TVA.
