# TypeScript Go Testing

Ce document explique comment tester Immutable.js avec TypeScript Go (ts-go), le port natif expérimental de TypeScript.

## Qu'est-ce que TypeScript Go ?

TypeScript Go est un port natif expérimental du compilateur TypeScript, écrit en Go au lieu de TypeScript/JavaScript. Il fait partie du projet TypeScript 7.0.

- **Repository GitHub**: https://github.com/microsoft/typescript-go
- **Blog Microsoft**: https://devblogs.microsoft.com/typescript/typescript-native-port/
- **Package npm**: [@typescript/native-preview](https://www.npmjs.com/package/@typescript/native-preview)

## Installation

Le package `@typescript/native-preview` est déjà installé comme dépendance de développement :

```bash
npm install
```

## Utilisation

### Vérifier la version

```bash
npx tsgo -v
```

Devrait afficher quelque chose comme : `Version 7.0.0-dev.20251027.1`

### Tester la compilation avec TypeScript Go

```bash
npm run type-check:tsgo
```

Ce script :
1. Affiche la version de TypeScript Go
2. Compile le projet avec tsgo
3. Continue même en cas d'erreurs (car tsgo est en développement)

### Compiler un fichier spécifique

```bash
npx tsgo --project tsconfig.src.json --noEmit
```

## CI/CD

Un workflow GitHub Actions dédié a été créé : `.github/workflows/tsgo-test.yml`

Ce workflow :
- S'exécute sur les branches `main`, `5.x`, `6.x`, et `copilot/update-typescript-version-and-tests`
- S'exécute sur les pull requests
- Teste la compatibilité du code avec TypeScript Go
- Affiche les versions de TypeScript et TypeScript Go
- Continue même en cas d'erreurs de compilation TypeScript Go

## Différences avec TypeScript standard

TypeScript Go est une version expérimentale en développement actif. Des différences de comportement sont attendues :

### Erreurs connues

Actuellement, TypeScript Go signale quelques erreurs dans le code :
- `src/functional/get.ts` : Problèmes de types avec `undefined`
- `src/utils/deepEqual.ts` : Directives `@ts-expect-error` non utilisées

Ces erreurs sont attendues car TypeScript Go peut avoir des règles de typage plus strictes ou différentes.

## Notes importantes

⚠️ **TypeScript Go est expérimental** : Ne pas l'utiliser pour la production

- La version standard de TypeScript (5.7) est toujours utilisée pour la compilation principale
- TypeScript Go est utilisé uniquement pour les tests de compatibilité
- Les builds de production utilisent TypeScript standard

## Mise à jour

Pour mettre à jour TypeScript Go vers la dernière version :

```bash
npm install --save-dev @typescript/native-preview@latest --legacy-peer-deps
```

## Resources

- [Annonce TypeScript Native Port](https://devblogs.microsoft.com/typescript/typescript-native-port/)
- [Repository TypeScript Go](https://github.com/microsoft/typescript-go)
- [Package npm](https://www.npmjs.com/package/@typescript/native-preview)
