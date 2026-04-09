# Rétrospective — Sprint 2 (Epics 6–9)

**Date :** 2026-03-09
**Scope :** 4 epics, 11 stories, 43 nouveaux tests (23 API + 20 E2E)
**Régression totale :** 125 tests GREEN (73 API + 52 E2E)

---

## Ce qui a bien fonctionné

- **ATDD discipline maintenue** : Chaque story a suivi RED → GREEN. Les tests ont détecté le bug `relation` non inclus dans `ALLOWED_EVENT_TYPES` avant qu'il ne passe en production
- **Architecture modulaire payante** : L'ajout des modules `food` et `bowls` (models, schemas, service, router) s'est fait sans toucher au code Sprint 1 — zéro régression
- **Alembic migration chain stable** : 6 migrations chaînées proprement, toutes idempotentes, appliquées sans problème sur DB fraîche
- **Sprint planning BMAD efficace** : Les 7 étapes (product brief addendum → PRD update → architecture addendum → epics → readiness check → sprint-status → ATDD tests) ont permis de livrer 11 stories sans blocage
- **Réutilisation des patterns Sprint 1** : Les conventions Svelte 5 (`$state`, `$derived`, `$props`, `{@render}`), les fixtures de test (`seedPet`), et les patterns API (service layer → router) ont été réutilisés tels quels

## Ce qui a posé problème

| Problème | Impact | Résolution |
|----------|--------|------------|
| `ALLOWED_EVENT_TYPES` non mis à jour pour `relation` | Events de type `relation` rejetés silencieusement par la validation Pydantic | Ajout de `"relation"` dans la liste du schema |
| Svelte 5 strict mode + announcer | `getByText('EditCatRenamed')` matchait le heading ET l'announcer Svelte interne | Remplacé par `getByRole('heading', { name: ... })` |
| Vite HMR ne détecte pas les nouveaux dossiers de routes | Nouvelles pages (`/food`, `/bowls`, `/pets/new`, `/pets/[id]/edit`) invisibles sans restart | Restart frontend dev server après ajout de routes |
| SQLite locking toujours présent | Inchangé — `--workers=1` reste nécessaire | Accepté comme contrainte SQLite |

## Leçons apprises

1. **Validators must be exhaustive** : Quand on ajoute un nouveau type d'événement, il faut mettre à jour TOUS les validateurs (Pydantic, frontend selectors, etc.). Un checklist serait utile
2. **Svelte 5 testing** : Préférer `getByRole` et `getByTestId` plutôt que `getByText` — le rendering Svelte ajoute des éléments invisibles (announcer) qui peuvent matcher
3. **Alembic sur SQLite** : Les migrations manuelles (leçon Sprint 1) sont confirmées comme la norme — autogenerate reste non fiable
4. **Architecture addendum > full rewrite** : Créer un addendum d'architecture plutôt que modifier le doc principal évite les conflits et garde la traçabilité

## Métriques

| Métrique | Sprint 1 | Sprint 2 | Total |
|----------|----------|----------|-------|
| Epics | 5 | 4 | 9 |
| Stories | 20 | 11 | 31 |
| Tests API | 50 | 23 | 73 |
| Tests E2E | 32 | 20 | 52 |
| Total tests | 82 | 43 | 125 |
| Migrations | 3 | 3 | 6 |
| Modules backend | 4 (pets, health, mqtt, commands) | +2 (food, bowls) | 6 |
| Routes frontend | 4 (/pets, /pets/[id], dashboard, infra) | +6 (/pets/new, /pets/[id]/edit, /food, /food/products/new, /bowls) | 10 |

## Lacunes produit restantes

### UX / Fonctionnel
- **Pas de responsive testing réel** : Tests Playwright en viewport desktop uniquement
- **Pas de multi-utilisateurs** : Toujours un seul propriétaire implicite
- **Pas de notifications push** : Les alertes stock MQTT sont prêtes backend mais pas connectées à un broker réel
- **Photos de profil** : Le formulaire de création/édition animal n'intègre pas encore l'upload photo (l'API existe)
- **Estimation consommation** : L'algo est basique (total servings / jours) — pas de ML ou de patterns journaliers

### Technique
- **Pas de Docker compose** : L'app tourne en dev mode (uvicorn + vite dev), pas de conteneurisation production
- **Pas de CI/CD** : Tests manuels uniquement
- **Pas de auth** : Aucune authentification — acceptable pour self-hosted single-user

## Recommandation

Toutes les fonctionnalités définies dans le PRD et les epics (1-9) sont **implémentées et testées**. Options :

1. **Ship as-is** : L'app est fonctionnelle pour un usage self-hosted. Dockeriser et déployer
2. **Sprint 3 — Hardening** : Docker compose, CI/CD, responsive, photo upload dans les formulaires
3. **Sprint 3 — Nouvelles features** : Multi-utilisateurs, alertes MQTT réelles, dashboards analytics avancés
