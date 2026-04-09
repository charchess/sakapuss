# Sakapuss Test Suite

Ce répertoire contient la suite de tests automatisés pour Sakapuss, utilisant **Playwright**.

## 🚀 Installation

```bash
cd frontend
npm install
npx playwright install --with-deps
```

## 🏃 Exécution des Tests

- **Mode Headless (Standard)** : `npm run test:e2e`
- **Mode UI (Debug)** : `npx playwright test --ui`
- **Debug d'un test spécifique** : `npx playwright test tests/e2e/file.spec.ts --debug`

## 🏗 Architecture des Tests

- **Tests E2E** : Situés dans `tests/e2e/`. Focus sur les parcours utilisateurs critiques.
- **Support** :
  - `fixtures/` : Extensions Playwright pour injecter des données (`seedPet`).
  - `factories.ts` : Générateurs de données dynamiques utilisant `faker`.
  - `helpers/` : Utilitaires partagés (Auth, API).

## 💡 Best Practices

1. **Isolation** : Chaque test doit être indépendant. Utilisez les factories pour créer des données uniques.
2. **Sélecteurs** : Privilégiez `data-testid` (ex: `page.getByTestId('login-btn')`).
3. **Zéro Hard Wait** : Utilisez les attentes d'événements réseau ou d'état (`toBeVisible`) plutôt que des timeouts fixes.
4. **Cleanup** : Les fixtures gèrent automatiquement le nettoyage des données créées en base.

## 📚 Références BMAD

- [Test Quality Definition of Done](../_bmad/tea/testarch/knowledge/test-quality.md)
- [Data Factories Pattern](../_bmad/tea/testarch/knowledge/data-factories.md)
