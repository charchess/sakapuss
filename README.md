# Sakapuss

Hub de santé animale — log-first, l'entrée c'est l'action, pas l'animal.

## Concept

Sakapuss est un carnet de santé animal connecté. Le coeur de l'app est le **Quick Log** : enregistrer une action (caisse nettoyée, gamelle remplie, pesée, médicament, observation) en **moins de 3 secondes**.

Les animaux parlent en première personne. L'interface est pensée mobile-first, avec des formes organiques et une palette expressive.

## Stack

| Layer | Tech |
|-------|------|
| Backend | Python 3.12, FastAPI, SQLAlchemy 2.0, SQLite, Alembic |
| Frontend | TypeScript, SvelteKit 5, Vite |
| Auth | JWT (bcrypt), Bearer token |
| MQTT | gmqtt (Home Assistant integration) |
| Tests | Playwright (API + E2E), pytest |
| CI | GitHub Actions (lint, test, build, push) |
| Deploy | Docker, GHCR, Kubernetes |

## Démarrage rapide

### Prérequis

- Python 3.12+
- Node.js 24+ (voir `.nvmrc`)
- Docker (optionnel, pour le déploiement)

### Dev local

```bash
# Backend
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
PYTHONPATH=. python -m alembic -c backend/alembic.ini upgrade head
PYTHONPATH=. python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000

# Frontend (dans un autre terminal)
cd frontend
npm install
npm run dev -- --port 5173 --host 0.0.0.0
```

L'app est accessible sur `http://localhost:5173`. L'API sur `http://localhost:8000/docs` (Swagger).

### Docker Compose

```bash
docker compose up --build
```

- Frontend : `http://localhost` (port 80)
- Backend API : `http://localhost/api/`

### Kubernetes

Les images sont publiées automatiquement sur GHCR à chaque push sur `main` :

```
ghcr.io/charchess/sakapuss-backend:latest
ghcr.io/charchess/sakapuss-frontend:latest
```

Déployer :

```bash
kubectl apply -f k8s/deployment.yaml
```

Adapter le hostname dans l'Ingress (`sakapuss.local` → votre domaine).

## Architecture

```
sakapuss/
├── backend/
│   ├── main.py                  # FastAPI app + health checks
│   ├── requirements.txt
│   ├── alembic/                 # 13 migrations
│   └── app/
│       ├── core/                # config, auth (JWT+bcrypt), MQTT bridge
│       ├── db/                  # SQLAlchemy session, base
│       ├── api/                 # Routes (auth, pets, events, reminders, food, bowls, resources, household, vet)
│       ├── modules/             # Models + schemas + services (pets, health, users, food, household, vet)
│       └── services/            # Anomaly detection, analytics
├── frontend/
│   ├── src/
│   │   ├── app.css              # Design System tokens (76 variables)
│   │   ├── lib/components/      # BottomNav, QuickLogSheet, ConfirmationToast
│   │   └── routes/              # 21 pages SvelteKit
│   └── playwright.config.ts
├── tests/                       # 70 Playwright tests (API + E2E)
├── k8s/                         # Kubernetes manifests
├── .github/workflows/
│   ├── test.yml                 # Quality pipeline (7 stages)
│   └── build-push.yml           # Docker build + GHCR push
└── docker-compose.yml
```

## Features

### Core Loop (Quick Log)

- **Caisse nettoyée** — multi-sélection caisses colorées, poids des déjections (par caisse ou global), note
- **Gamelle remplie** — groupées par emplacement, produit pré-sélectionné, quantité pré-remplie (modifiable)
- **Pesée** — saisie du poids en kg
- **Médicament** — nom + note
- **Observation** — 11 tags comportementaux (vomissement, diarrhée, léthargie...) + note libre
- **Événement** — saisie libre

### Configuration (Settings)

Chaque feature est configurable et désactivable indépendamment :

- **Caisses** — nom, couleur, mode de pesée (par caisse / global / désactivé). La désactivation conserve les données.
- **Gamelles** — nom, emplacement, produit assigné, quantité par défaut
- **Produits alimentaires** — nom, marque, type (croquettes, pâtée, friandises)
- **Stock** — sacs avec poids, état (en réserve → ouvert → terminé), estimation du restant + date d'épuisement
- **Foyer** — membres avec rôles (Total / Saisie / Consultation)

### Santé

- **Rappels** — vermifuge, antipuce, vaccins avec fréquence configurable. Done / Postpone (+3j, +1sem, +2sem). Prochain rappel auto-planifié.
- **Timeline** — feed chronologique filtrable par catégorie (Poids, Santé, Alimentation, Litière, Comportement)
- **Anomalies** — détection automatique de perte de poids (>5% sur 2 semaines)
- **Profil animal** — hero card, poids avec tendance, rappels actifs, activité récente

### Multi-utilisateurs

- Invitation par email avec profil d'accès (Total / Saisie / Consultation)
- Dashboard adapté au rôle
- Ressources partagées (caisses, gamelles) au niveau du foyer

### Vétérinaire

- Lien permanent révocable — le vétérinaire voit le dossier **sans créer de compte**
- Portail cabinet optionnel (recherche patients, alertes proactives)
- Dossier filtré par défaut aux catégories médicales

### Home Assistant

- MQTT Discovery endpoint (`/mqtt/discovery`) — entités sensor, binary_sensor, button par animal
- Validation bidirectionnelle (marquer un rappel comme fait depuis HA/voix)
- Alertes stock nourriture via MQTT

## Tests

```bash
# Backend (pytest)
PYTHONPATH=. python -m pytest backend/tests/ -v

# API tests (Playwright)
cd frontend && npx playwright test --project=api

# E2E tests (Playwright)
cd frontend && npx playwright test --project=chromium
```

37 tests pytest + 70 tests Playwright = **107+ tests**.

## CI/CD

Le pipeline GitHub Actions (`test.yml`) a 7 stages :

1. **Security** — Gitleaks (secrets) + npm audit + pip audit
2. **Lint** — Ruff (Python) + svelte-check (TypeScript)
3. **Backend Tests** — pytest avec coverage
4. **API Tests** — Playwright project `api`
5. **E2E Tests** — Playwright chromium + mobile-chrome (matrix)
6. **Burn-In** — 5 itérations flaky detection (PRs uniquement)
7. **Quality Gate** — décision finale

Le build Docker (`build-push.yml`) push sur GHCR à chaque merge sur `main`.

### Pre-commit hooks

```bash
pip install pre-commit
pre-commit install
```

Hooks : gitleaks, ruff, svelte-check, hadolint, trailing whitespace, merge conflicts.

## Design System

Tokens CSS définis dans `frontend/src/app.css` :

- **Couleurs** : Primary #6C5CE7, Secondary #00CEC9, 8 couleurs par catégorie
- **Typographie** : Nunito (display), Inter (body)
- **Spacing** : scale de space-2xs (2px) à space-3xl (48px)
- **Formes** : chaque action a sa propre forme et gradient (pas de grille générique)

Les prototypes HTML interactifs sont dans `_bmad-output/prototypes/index.html`.

## Licence

Projet personnel.
