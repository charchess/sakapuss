# 06 : Thomas note une observation

**Project:** Sakapuss
**Created:** 2026-04-08
**Method:** Whiteport Design Studio (WDS)
**Design Intent:** D (Dream Up)
**Design Status:** not-started

---

## Transaction (Q1)

**What this scenario covers:**
Thomas accepte l'invitation de Camille, découvre l'app, et fait sa première saisie en moins de 30 secondes.

---

## Business Goal (Q2)

**Goal:** BG0 — THE ENGINE : 100 Propriétaires Actifs en 6 mois
**Objective:** Thomas actif = données foyer enrichies = Camille plus fidèle. Valide le modèle "contributeur minimal friction" avant le modèle cabinet (scénario 08).

---

## User & Situation (Q3)

**Persona:** Thomas le Contributeur (Secondary)
**Situation:** Thomas reçoit une notification ou un email "Camille t'a ajouté à Sakapuss pour Pixel et Luna". Il est chez lui, téléphone en main, curieux de voir ce que c'est — mais sans intention d'apprendre quoi que ce soit.

---

## Driving Forces (Q4)

**Hope:** Comprendre en 5 secondes ce qu'il doit faire et noter quelque chose sans se planter.

**Worry:** Tomber sur une interface incompréhensible, faire une erreur, ou fausser les données de Camille.

---

## Resource Model — Caisses

> Les caisses sont des **ressources du foyer** nommées librement par Camille (Caisse 1, Caisse cuisine, Caisse rouge...) — pas liées à un animal spécifique. Thomas choisit quelle caisse il a nettoyée, pas quel chat.
>
> Ce principe s'applique aussi aux gamelles et autres ressources partagées du foyer.

---

## Device & Starting Point (Q5 + Q6)

**Device:** Mobile
**Entry:** Thomas reçoit le lien d'invitation par email ou notification, l'ouvre directement sur son téléphone, atterrit sur l'onboarding Thomas.

---

## Best Outcome (Q7)

**User Success:** Thomas a fait sa première saisie en moins de 30 secondes, vu la confirmation "Caisse cuisine nettoyée — 09h14", et compris que c'est tout ce qu'on lui demande.

**Business Success:** Modèle contributeur validé — Thomas actif = données foyer enrichies = Camille plus engagée.

---

## Shortest Path (Q8)

1. **Onboarding Thomas** — Il ouvre le lien d'invitation, crée son accès (ou accepte directement si OAuth). L'app lui explique son rôle en une phrase : "Tu peux noter ce que tu fais pour Pixel et Luna."
2. **Dashboard Thomas** — Grille réduite aux actions de son profil Saisie. Il tape "Caisse nettoyée" → choisit "Caisse cuisine" (ressource foyer) → confirmation immédiate. ✓

*Storyboard items :*
- *Pas de configuration — le profil Saisie est déjà configuré par Camille*
- *Feedback "ta contribution est visible par Camille" (renforce la valeur perçue de Thomas)*
- *Ressources foyer (caisses, gamelles) nommées par Camille — Thomas choisit parmi la liste*

---

## Trigger Map Connections

**Persona:** Thomas le Contributeur (Secondary)

**Driving Forces Addressed:**
- ✅ **Want:** Contribuer sans apprendre une nouvelle complexité
- ❌ **Fear:** Faire une erreur et fausser les données

**Business Goal:** BG0 — THE ENGINE — enrichissement passif du dossier foyer, rétention Camille renforcée.

---

## Scenario Steps

| Step | Folder | Purpose | Exit Action |
|------|--------|---------|-------------|
| 06.1 | `06.1-onboarding-thomas/` | Accepter l'invitation + comprendre son rôle | Accède au Dashboard Thomas |
| 06.2 | `06.2-dashboard-thomas/` | Première saisie en moins de 30 secondes | Confirmation → saisie enregistrée ✓ |

**Step 06.1** inclut le contexte d'entrée complet (Q3 + Q4 + Q5 + Q6).
