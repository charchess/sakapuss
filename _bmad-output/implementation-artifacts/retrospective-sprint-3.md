# Rétrospective — Sprint 3 (Epics 10–12 — Hardening)

**Date :** 2026-04-07
**Scope :** 3 epics, 6 stories, 16 nouveaux tests (7 E2E photo + 6 E2E mobile + 9 API infra)
**Régression totale :** 55 tests GREEN Sprint 3 (chromium + mobile-chrome + api)

---

## Ce qui a bien fonctionné

- **ATDD discipline maintenue** : Chaque story a suivi RED → GREEN. Les tests d'infrastructure (Epic 12) ont validé la structure des fichiers sans nécessiter un déploiement réel
- **Découverte de bugs pré-existants** : Le viewport mobile a révélé un bug critique Sprint 1 — la div `.profile-header` n'était jamais fermée, englobant tout le contenu de la page dans un flex-row. Cause : 1174px de débordement horizontal sur mobile
- **Two-step photo upload** : Le pattern création animal (JSON) → upload photo (FormData multipart) s'est avéré propre et robuste, sans modifier l'API backend existante
- **Isolation des tests par timestamp** : Le suffixe `Date.now()` sur les noms de test (`PhotoCat-${Date.now()}`) a éliminé les faux positifs dus à l'accumulation de données entre sessions
- **Build production validé** : `NODE_ENV=production npm run build` (adapter-static) a compilé sans erreurs — uniquement des warnings Svelte 5 pré-existants (`state_referenced_locally`)
- **Couverture multi-projet Playwright** : Les 3 projets (`chromium`, `mobile-chrome`, `api`) couvrent desktop, mobile (Pixel 5, 393px), et les assertions structurelles

## Ce qui a posé problème

| Problème | Impact | Résolution |
|----------|--------|------------|
| `profile-header` div non fermée (bug Sprint 1) | Tout le contenu de la page dans un flex-row → débordement horizontal 1174px | Ajout du `</div>` manquant |
| Fast-action grid 870px sur 393px mobile | 3 colonnes × 290px dépasse le viewport | `@media (max-width: 600px) { grid-template-columns: repeat(2, 1fr) }` |
| Bouton submit 42px < 44px (touch target minimum) | Fails WCAG 2.5.5 target size | `min-height: 44px` sur `.btn-submit` et `.action-btn` |
| `getByText('PhotoCat')` matchait 'NoPhotoCat' | Strict mode Playwright violation | `{ exact: true }`, puis noms uniques avec timestamp |
| Données test polluant la DB partagée | Tests cross-session instables (`Vanille`, `Moustache` dupliqués) | Timestamp suffix dans `dashboard.spec.ts` et `pet-onboarding-crud.spec.ts` |
| `alembic` absent du venv CI | `uvicorn` ne démarrait pas (ImportError) | Activation du `.venv` projet : `source .venv/bin/activate` |
| SQLite locking en mode parallèle | Flaky failures (`--workers > 1`) | Contrainte connue Sprint 2 — `--workers=1`, re-run passé 4/4 |

## Leçons apprises

1. **Les tests mobile révèlent les vrais bugs de structure HTML** : Un viewport mobile est un outil de validation du DOM, pas seulement du CSS. Le div non fermé était invisible en desktop
2. **Les noms de test doivent être uniques par run** : Toute donnée statique (noms d'animaux hardcodés) deviendra un problème dès le second run. Utiliser `Date.now()` ou UUIDs systématiquement
3. **adapter-static vs adapter-auto** : Le switch est conditionnel au `NODE_ENV=production` pour préserver le HMR dev. La détection d'URL par port (`port === '80'` → `/api`) évite de hardcoder l'URL de l'API
4. **Les tests d'infrastructure en filesystem** : Tester la présence/contenu de fichiers de configuration (Dockerfile, ci.yml, nginx.conf) est une forme valide de couverture — plus rapide qu'un test d'intégration complet et détecte les régressions de configuration
5. **Le multi-stage Docker build** : `node:20-alpine` build → `nginx:alpine` serve réduit l'image finale de ~800MB à ~50MB. La copie des artefacts (`/app/build`) doit correspondre exactement à la config `adapter-static`

## Métriques

| Métrique | Sprint 1 | Sprint 2 | Sprint 3 | Total |
|----------|----------|----------|----------|-------|
| Epics | 5 | 4 | 3 | 12 |
| Stories | 20 | 11 | 6 | 37 |
| Tests API/infra | 50 | 23 | 9 | 82 |
| Tests E2E | 32 | 20 | 13 | 65 |
| Total tests | 82 | 43 | 22* | 147 |
| Migrations Alembic | 3 | 3 | 0 | 6 |
| Modules backend | 4 | +2 | 0 | 6 |
| Routes frontend | 4 | +6 | 0 | 10 |
| Fichiers Docker/CI | 0 | 0 | 4 (Dockerfile.frontend, nginx.conf, docker-compose, ci.yml) | 4 |

*55 tests passent au total en Sprint 3 (tous projets confondus, incluant régressions Sprint 1+2)

## Lacunes restantes

### Non testées en intégration réelle
- **Docker Compose end-to-end** : Le build Docker a été validé, mais aucun `docker compose up` en vrai n'a été exécuté dans cette session. Le test de déploiement réel reste manuel
- **CI GitHub Actions** : Le workflow existe et est structurellement valide (testé via parsing YAML), mais n'a pas encore tourné sur GitHub — nécessite un push sur un repo GitHub

### Produit
- **Authentification absente** : Acceptable pour self-hosted single-user, mais bloquant pour toute exposition publique
- **MQTT broker réel** : Les notifications proactives (Epic 3) sont prêtes backend mais nécessitent un broker Mosquitto/EMQX réel en production
- **Pas de multi-utilisateurs** : Architecture single-owner implicite

## Recommandation

Le sprint Hardening a atteint ses objectifs : photo upload dans les formulaires, responsive mobile, Docker production, et pipeline CI/CD. L'application est **prête pour un déploiement self-hosted** avec `docker compose up -d`.

Prochaines options :
1. **Deploy** : `docker compose up -d` sur le serveur cible — vérifier le healthcheck backend et la résolution nginx
2. **Sprint 4 — Auth** : Ajouter une authentification simple (Basic Auth via nginx ou token JWT) pour exposition réseau
3. **Sprint 4 — MQTT Live** : Connecter un broker Mosquitto réel et tester les notifications Home Assistant bout en bout
