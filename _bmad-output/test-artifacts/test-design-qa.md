---
stepsCompleted: ['step-05-generate-output']
lastStep: 'step-05-generate-output'
lastSaved: '2026-03-04'
---

# Test Design for QA: Sakapuss (Full Coverage)

**Purpose:** Test execution recipe for QA team. Defines what to test and how to test it.

**Date:** 2026-03-04
**Author:** Murat (Master Test Architect)
**Status:** Draft
**Project:** Sakapuss

---

## 🎯 Test Scenarios and Priorities

### P0 (Critical)
*Criteria: Core functionality, high risk, mandatory legal.*

| Test ID | Requirement | Level | Notes |
|---|---|---|---|
| **P0-001** | CRUD Profil Pet | API | Valider la création complète avec photo. |
| **P0-002** | Log Routine (1-tap) | API | Valider l'intégrité de l'événement "RAS". |
| **P0-003** | Calcul Next Due Date | Unit | Tester les périodicités complexes (ex: 3 mois, 1 an). |
| **P0-004** | Medical Disclaimer | E2E | Vérifier la présence sur mobile et export PDF. |

### P1 (High)
*Criteria: Critical paths, medium/high risk.*

| Test ID | Requirement | Level | Notes |
|---|---|---|---|
| **P1-001** | Discovery MQTT | Integr. | Vérifier la création d'entités dans HA. |
| **P1-002** | Validation MQTT Command | Integr. | Simuler un "Done" depuis HA. |
| **P1-003** | Corrélation 72h | API | Injecter un changement de nourriture puis un symptôme. |

### P2 (Medium)
*Criteria: Visuals, UX secondary.*

| Test ID | Requirement | Level | Notes |
|---|---|---|---|
| **P2-001** | Rendu Graphique Poids | Comp. | Valider les points de données sur le frontend. |
| **P2-002** | UX Mobile 1-Tap | E2E | Vérifier le flow de moins de 3 clics. |

---

## 🚀 Execution Strategy

- **PR Validation** : Exécution automatique via GitHub Actions / GitLab CI de tous les tests **Unit** et **API**. Objectif de feedback < 5 min.
- **Integration & E2E** : Exécution quotidienne (Nightly) sur l'image Docker de staging incluant un broker Mosquitto.

---

## 📊 QA Effort Estimate

| Priority | Count | Effort Range | Notes |
|---|---|---|---|
| P0 | 4 | 15-25h | Framework + Core tests + Legal. |
| P1 | 3 | 10-20h | Logique MQTT & Corrélation. |
| P2/P3 | 2 | 5-15h | Visualisation & UX. |
| **Total** | **9** | **~30-60h** | **Environ 1.5 à 3 semaines.** |

---

## 🛠 Tooling & Access

| Tool | Purpose | Status |
|---|---|---|
| **Playwright** | E2E & Component Testing | Pending |
| **Pytest** | Backend Unit & API Testing | Pending |
| **Mosquitto** | MQTT Broker pour tests d'intégration | Pending |

---

**End of QA Document**
