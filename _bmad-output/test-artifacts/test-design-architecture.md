---
stepsCompleted: ['step-05-generate-output']
lastStep: 'step-05-generate-output'
lastSaved: '2026-03-04'
---

# Test Design for Architecture: Sakapuss (System Hub)

**Purpose:** Architectural concerns, testability gaps, and NFR requirements for review by Architecture/Dev teams.

**Date:** 2026-03-04
**Author:** Murat (Master Test Architect)
**Status:** Architecture Review Pending
**Project:** Sakapuss
**PRD Reference:** _bmad-output/planning-artifacts/prd.md
**ADR Reference:** _bmad-output/planning-artifacts/architecture.md

---

## Executive Summary

**Scope:** Sakapuss est un hub de santé animale auto-hébergé avec intégration MQTT bidirectionnelle et moteur de corrélation de données.

**Architecture (from ADR):**
- **Decision 1:** Backend FastAPI (async) avec SQLAlchemy 2.0.
- **Decision 2:** Frontend SvelteKit (Mobile-first) avec types générés.
- **Decision 3:** Intégration MQTT 5.0 (Discovery) pour Home Assistant.

**Risk Summary:**
- **Total risks**: 5
- **High-priority (≥6)**: 1 (Désynchronisation MQTT)
- **Test effort**: ~30–60 heures d'effort estimé.

---

## Quick Guide

### 🚨 BLOCKERS - Team Must Decide (Can't Proceed Without)

1. **B1: MQTT Test Infrastructure** - Nécessité d'un broker de test (Mosquitto) dans le Docker-compose de dev pour valider les boucles de feedback. (Owner: DevOps/Dev)
2. **B2: Time Injection Pattern** - Besoin d'un moyen propre d'injecter des timestamps passés dans l'API pour tester le moteur de corrélation 72h. (Owner: Backend Dev)

---

## For Architects and Devs - Open Topics 👷

### Risk Assessment

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner |
|---|---|---|---|---|---|---|---|
| **R1** | **TECH** | Désynchronisation d'état Sakapuss ↔ HA. | 2 | 3 | **6** | Suite de tests d'intégration MQTT asynchrone. | Dev |
| **R2** | **DATA** | Corruption des payloads JSON polymorphes. | 1 | 3 | **3** | Validation Pydantic v2 stricte. | Backend |
| **R3** | **PERF** | Latence UX sur validation MQTT. | 2 | 2 | **4** | Optimisation des workers asynchrones. | Backend |

### Testability Concerns and Architectural Gaps

**🚨 ACTIONABLE CONCERNS - Architecture Team Must Address**

#### 1. Blockers to Fast Feedback
- **No MQTT Mocking Strategy** → Impossible de tester la proactivité sans HA réel → Fournir un simulateur MQTT ou un script de mock (Sprint 0).

#### 2. Architectural Improvements Needed
- **Audit des logs MQTT** : Ajouter des IDs de corrélation entre les messages MQTT Discovery et les entrées en base pour la traçabilité en cas d'échec de validation.

---

### Testability Assessment Summary

- ✅ **API-First** : Facilite grandement les tests de logique métier sans passer par l'UI.
- ✅ **Statelessness** : Permet des tests d'intégration robustes et isolés.
- ✅ **SQLite** : Temps de reset de la base quasi instantané (< 100ms).

---

**End of Architecture Document**
