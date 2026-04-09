---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments: ['product-brief-sakapuss-2026-02-27.md', 'prd.md', 'brainstorming-session-2026-03-04.md']
workflowType: 'architecture'
project_name: 'Sakapuss'
user_name: 'Charchess'
date: '2026-03-04'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
Le projet repose sur un système d'événements polymorphes centralisé dans une timeline unifiée. L'architecture doit supporter la gestion des profils (CRUD), le suivi de santé (poids, vaccins) et surtout une interactivité bidirectionnelle via MQTT. La saisie mobile doit être ultra-rapide ("1-tap"), ce qui impose une logique de "Decision Tree" en frontend.

**Non-Functional Requirements:**
- **Interopérabilité (MQTT)** : Support de MQTT Discovery pour une intégration native dans Home Assistant. Latence cible < 1s pour les commandes.
- **Disponibilité Technique** : Pont MQTT avec un uptime de 99.9%.
- **Légal & Sécurité** : Disclaimer médical obligatoire sur tous les points d'analyse.
- **Performance** : Temps de réponse API < 200ms (p95).

**Scale & Complexity:**
Le projet est de complexité **Moyenne**. Bien que le périmètre fonctionnel soit ciblé, l'intégration IoT bidirectionnelle et le moteur de corrélation ajoutent une couche de logique métier non triviale.

- Primary domain: Full-stack Web App with MQTT/Home Automation integration.
- Complexity level: Medium
- Estimated architectural components: 5 (Frontend, Backend API, Database, MQTT Bridge, Correlation Engine)

### Technical Constraints & Dependencies

- **Home Assistant / MQTT Broker** : Dépendance critique pour la proactivité et la validation des actions.
- **SQLite** : Choisi pour la simplicité de l'auto-hébergement et du backup.
- **Docker** : Format de distribution cible imposant une encapsulation complète.

### Cross-Cutting Concerns Identified

- **Synchronisation d'état MQTT** : S'assurer que l'état dans Sakapuss et dans HA est toujours cohérent.
- **Internationalisation (i18n)** : Support FR/EN dès la conception du modèle de données.
- **Gestion des Médias** : Stockage et génération de vignettes pour les photos liées aux événements de santé.
- **Disclaimer Légal** : Injection systématique de l'avertissement médical dans les rapports et vues analytiques.

## Starter Template Evaluation

### Technology Preferences

- **Languages**: TypeScript (Frontend), Python 3.14 (Backend).
- **Frameworks**: SvelteKit 2.53.0, FastAPI 0.135.1.
- **Databases**: SQLite (Local file persistence).
- **Protocols**: MQTT 5.0 (Discovery integration).

### Selected Foundations

**Core Architectural Patterns:**
- **Monolith with Internal Modules**: Un seul conteneur Docker, mais une séparation claire entre l'API REST et le pont MQTT.
- **Event-Driven Core**: Un bus d'événements interne pour synchroniser les logs de santé avec les messages MQTT Discovery.
- **Mobile-First SPA**: SvelteKit configuré en mode Single Page App pour une réactivité maximale sur mobile.

**Foundation Rationale:**
Ce choix privilégie la simplicité opérationnelle (un seul fichier DB, un seul conteneur) tout en offrant une interactivité riche (MQTT bidirectionnel) et une performance moderne (Python 3.14, Pydantic v2+).

## Core Architectural Decisions

### Data Architecture

- **ORM & Migrations**: **SQLAlchemy 2.0+** avec **Alembic** pour la gestion de schéma.
- **Data Modeling**: Table `Events` polymorphe avec un champ `payload` (JSONB simulé sur SQLite via JSON1 extension) pour stocker les détails spécifiques par type (Poids, Vaccin, Selles, etc.).
- **Validation**: **Pydantic v2.10+** pour la validation stricte des entrées API et MQTT.
- **Rationale**: Assure une flexibilité totale de la timeline tout en garantissant l'intégrité des données dans un fichier SQLite local unique.

### Connectivity & MQTT Patterns

- **MQTT Client**: **gmqtt** (asynchrone) pour une intégration native avec la boucle d'événements de FastAPI.
- **Discovery Strategy**: Publication automatique des payloads de configuration au démarrage sur le topic `homeassistant/`.
- **Feedback Loop**: Sakapuss écoute les topics de "command" (`sakapuss/vanille/vaccin/set`) pour valider les actions de santé déclenchées par l'utilisateur via HA ou commande vocale.
- **Rationale**: Permet le workflow "HA-First" demandé, transformant Sakapuss en un agent intelligent au sein du réseau local.

### Authentication & Security

- **Authentication Strategy**: **OAuth2 with JWT** (standard FastAPI) for standard web sessions.
- **Home Assistant Integration**: Support for **HA Ingress Authentication** via `X-Has-User-ID` headers when deployed as an HA Add-on.
- **Legal Compliance**: Middleware-level injection of medical disclaimer on all reporting and analytical API endpoints.
- **Rationale**: Provides a balance between local-first simplicity and robust security when exposed via Home Assistant or a reverse proxy.

### Frontend Architecture (SvelteKit)

- **State Management**: **Svelte Native Stores** for managing the complex state of the "1-tap" decision tree before submission.
- **Type Safety**: **openapi-typescript** generation from FastAPI OpenAPI schema to ensure full end-to-end type safety (Pydantic models to TypeScript types).
- **Styling Strategy**: **Vanilla CSS with Variables** (Light/Dark mode) for a zero-dependency, lightweight UI compatible with HA dashboard themes.
- **Rationale**: Prioritizes performance and maintainability while minimizing bundle size for low-power devices.

## Decision Impact Analysis

### Implementation Sequence

1. **Backend Skeleton**: FastAPI + SQLite + Alembic setup.
2. **MQTT Engine**: gmqtt integration with HA Discovery logic.
3. **API Core**: Pydantic models and Polymorphic Event schema.
4. **Frontend Foundation**: SvelteKit + Type generation from API.
5. **UI Development**: "1-tap" Decision Tree and Timeline views.

### Cross-Component Dependencies

- **MQTT ↔ API**: The backend must synchronize MQTT command inputs with the central SQLite database to maintain a single source of truth for health logs.
- **Schema ↔ UI**: The polymorphic nature of the events means the UI must dynamically render input forms based on the Pydantic schema types.
- **Docker ↔ HA**: The container must expose the correct ports and volume mappings for HA to pick up the Add-on configuration and persistent database file.

## Implementation Patterns & Consistency Rules

### Naming Patterns

- **Database Naming**: Tables at plural (`pets`, `events`), columns in `snake_case` (`pet_id`, `created_at`).
- **API (FastAPI)**: Endpoints at plural (`/pets`, `/events/{id}`), `snake_case` for JSON parameters.
- **Frontend (SvelteKit)**: Components in `PascalCase` (`PetCard.svelte`), route files in `snake_case`, variables in `camelCase`.

### Structure Patterns

- **Tests**: Co-located with code (`*.test.ts` for frontend, `tests/` folder for backend).
- **Services**: Separate business logic (Correlation Engine) into Python service classes to keep FastAPI routes clean.
- **Assets**: Pet photos stored in a `/media` folder mounted as a Docker volume.

### Format Patterns

- **API Response**: No global wrapper (`{data: ...}`), direct response with standard HTTP codes (200, 201, 404). Errors follow FastAPI's `{"detail": "message"}` format.
- **Dates**: Always **ISO 8601** with UTC timezone.

### Enforcement Guidelines

**All AI Agents MUST:**
- Use **Pydantic** for all backend data validation.
- Regenerate TypeScript types (`openapi-typescript`) after any API schema modification.
- Inject the **Medical Disclaimer** into all new analytical views.

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
sakapuss/
├── docker-compose.yml
├── Dockerfile
├── README.md
├── .env.example
├── backend/
│   ├── main.py                 # Point d'entrée FastAPI
│   ├── alembic.ini             # Config migrations
│   ├── requirements.txt
│   ├── app/
│   │   ├── core/               # Config globale, Auth, MQTT Bridge
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── mqtt/           # Logique Discovery & Feedback Loop
│   │   ├── db/                 # Session SQLAlchemy, Base models
│   │   │   ├── session.py
│   │   │   └── base.py
│   │   ├── modules/            # Logique métier par domaine
│   │   │   ├── pets/           # Profils animaux
│   │   │   ├── health/         # Timeline, Poids, Vaccins (Polymorphe)
│   │   │   └── food/           # Stocks, Consommation
│   │   ├── services/           # Moteurs transverses
│   │   │   └── analytics/      # Moteur de corrélation
│   │   └── api/                # Routes REST (V1)
│   ├── alembic/                # Dossier des migrations
│   └── tests/                  # Tests unitaires & intégration
├── frontend/
│   ├── package.json
│   ├── svelte.config.js
│   ├── vite.config.ts
│   ├── src/
│   │   ├── app.html
│   │   ├── lib/
│   │   │   ├── api/            # Client généré openapi-typescript
│   │   │   ├── components/     # UI partagée (Buttons, Cards, Icons)
│   │   │   ├── stores/         # État de l'arbre de décision
│   │   │   └── features/       # Logique par écran (Timeline, Profile)
│   │   └── routes/             # Pages SvelteKit
│   └── static/                 # Assets statiques
└── media/                      # Volume monté pour les photos (Local)
```

### Architectural Boundaries

**API Boundaries:**
Seul le dossier `backend/app/api/` expose des endpoints. Tout échange Frontend ↔ Backend passe par ici.

**MQTT Boundary:**
Le dossier `backend/app/core/mqtt/` est le seul point de contact avec le broker. Il traduit les messages MQTT en appels de services internes.

**Data Boundary:**
Toute manipulation de la base SQLite passe par les modèles SQLAlchemy définis dans `backend/app/modules/`.
