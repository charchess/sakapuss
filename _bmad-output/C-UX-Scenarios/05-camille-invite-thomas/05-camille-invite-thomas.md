# 05 : Camille invite Thomas

**Project:** Sakapuss
**Created:** 2026-04-08
**Method:** Whiteport Design Studio (WDS)
**Design Intent:** D (Dream Up)
**Design Status:** not-started

---

## Transaction (Q1)

**What this scenario covers:**
Camille invite Thomas comme membre du foyer, choisit son profil d'accès (Total / Saisie / Consultation), et Thomas reçoit l'invitation.

---

## Business Goal (Q2)

**Goal:** BG0 — THE ENGINE : 100 Propriétaires Actifs en 6 mois
**Objective:** Thomas enrichit les données du foyer → renforce la valeur de Sakapuss pour Camille → la maintient active. Valide aussi l'architecture multi-utilisateurs nécessaire pour les cabinets vétérinaires (scénario 08).

---

## User & Situation (Q3)

**Persona:** Camille la Gardienne (Primary)
**Situation:** Camille utilise Sakapuss depuis quelques jours. Elle réalise que Thomas fait des choses pour les chats (caisse, gamelle, observations) mais que rien n'est tracé. Elle veut l'intégrer pour que le dossier soit complet.

---

## Driving Forces (Q4)

**Hope:** Thomas intégré en 2 minutes, il peut contribuer dès ce soir sans qu'elle ait besoin de lui expliquer quoi que ce soit.

**Worry:** Thomas ne prend pas la peine d'accepter l'invitation, ou l'oublie dans sa boîte mail — et elle se retrouve seule à tout noter.

---

## Access Profiles

Trois niveaux simples, choisis au moment de l'invitation :
- **Total** — accès complet (configuration, rappels, saisie, consultation)
- **Saisie** — peut logger des actions, pas de configuration ni rappels critiques *(défaut recommandé pour Thomas)*
- **Consultation** — lecture seule

Le profil fait le travail — pas de configuration granulaire requise.

---

## Device & Starting Point (Q5 + Q6)

**Device:** Mobile
**Entry:** Camille est dans l'app, navigue vers "Membres du foyer" depuis le menu principal ou les paramètres — réalise que Thomas n'est pas encore dans le système.

---

## Best Outcome (Q7)

**User Success:** Thomas reçoit l'invitation, l'accepte, et a accès à Sakapuss avec le profil Saisie — Camille voit son nom dans la liste des membres, le dossier va s'enrichir.

**Business Success:** Architecture multi-utilisateurs validée, données foyer enrichies — Camille reste active parce que le dossier devient plus complet sans effort supplémentaire de sa part.

---

## Shortest Path (Q8)

1. **Gestion du foyer** — Camille ouvre la liste des membres, tape "Inviter un membre". Elle entre l'email de Thomas, choisit le profil "Saisie", envoie l'invitation. ✓

*Storyboard items :*
- *Choix du profil (Total / Saisie / Consultation) avec description courte de chaque niveau*
- *Aperçu de ce que Thomas verra avec ce profil*
- *Statut de l'invitation (en attente / acceptée) dans la liste des membres*

La suite — Thomas accepte et fait sa première saisie — appartient au scénario 06.

---

## Trigger Map Connections

**Persona:** Camille la Gardienne (Primary)

**Driving Forces Addressed:**
- ✅ **Want:** Dossier enrichi par tout le foyer
- ❌ **Fear:** Données incomplètes (observations de Thomas non tracées)

**Business Goal:** BG0 — THE ENGINE — enrichissement passif du dossier via le foyer, rétention Camille renforcée.

---

## Scenario Steps

| Step | Folder | Purpose | Exit Action |
|------|--------|---------|-------------|
| 05.1 | `05.1-gestion-du-foyer/` | Inviter Thomas + choisir son profil | Invitation envoyée ✓ |

**Step 05.1** inclut le contexte d'entrée complet (Q3 + Q4 + Q5 + Q6).
