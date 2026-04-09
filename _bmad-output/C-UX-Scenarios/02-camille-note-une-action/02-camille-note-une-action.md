# 02 : Camille note sa première action

**Project:** Sakapuss
**Created:** 2026-04-08
**Method:** Whiteport Design Studio (WDS)
**Design Intent:** D (Dream Up)
**Design Status:** not-started

---

## Transaction (Q1)

**What this scenario covers:**
Enregistrer une observation ou une action en moins de 3 secondes, sans quitter ce qu'elle est en train de faire.

---

## Business Goal (Q2)

**Goal:** BG0 — THE ENGINE : 100 Propriétaires Actifs en 6 mois
**Objective:** Sans saisies régulières, pas de 4 semaines d'usage, pas de Propriétaire Actif. Ce scénario est le core loop — la métrique #1.

---

## User & Situation (Q3)

**Persona:** Camille la Gardienne (Primary)
**Situation:** Camille est chez elle, vient de faire quelque chose pour ses chats (caisse nettoyée, gamelle remplie, pesée, observation inhabituelle), attrape son téléphone pour le noter avant d'oublier.

---

## Driving Forces (Q4)

**Hope:** Noter en 3 tapotements et passer à autre chose — sans navigation, sans réfléchir.

**Worry:** Perdre 30 secondes à chercher où noter, ouvrir le mauvais menu, et finir par ne pas noter du tout.

---

## Design Principle — Friction Proportionnelle

> La rapidité d'accès est inversement proportionnelle à la complexité de l'action.
> - Action fréquente (gamelle, litière) → 2 taps
> - Action avec valeur (pesée) → 3 taps + saisie valeur
> - Événement libre ("a fait une chute") → formulaire court acceptable

**Pattern de confirmation (Option C) :** Après sélection de l'action + animal, confirmation rapide apparaît avec options discrètes en bas (📝 note / ⚖️ poids). Auto-enregistrement après ~3 secondes si ignorées. Tap sur icône → champ s'ouvre inline.

---

## Device & Starting Point (Q5 + Q6)

**Device:** Mobile
**Entry:** Camille déverrouille son téléphone, ouvre Sakapuss depuis l'écran d'accueil (raccourci PWA), atterrit directement sur le Dashboard avec la grille d'actions rapides visible immédiatement.

---

## Best Outcome (Q7)

**User Success:** L'action est enregistrée en moins de 3 secondes, Camille voit la confirmation "Caisse de Pixel nettoyée — 09h14" et reprend ce qu'elle faisait — sans friction, sans doute.

**Business Success:** Première entrée dans le journal — le core loop est validé, la métrique de saisie régulière BG0 commence à tourner.

---

## Shortest Path (Q8)

1. **Home / Dashboard** — Camille voit la grille d'actions rapides dès l'ouverture. Elle tape "Caisse nettoyée".
2. **Quick Log — sélection** — Elle choisit l'animal (Pixel). Action fréquente = confirme directement.
3. **Quick Log — confirmation** — Feedback immédiat avec options discrètes (📝 note / ⚖️ poids). Camille ignore → auto-enregistré après 3 sec. Ou tape 📝 → ajoute "diarrhée légère". ✓

---

## Trigger Map Connections

**Persona:** Camille la Gardienne (Primary)

**Driving Forces Addressed:**
- ✅ **Want:** Saisie en 3 secondes — réflexe quotidien
- ❌ **Fear:** App trop complexe → abandon

**Business Goal:** BG0 — THE ENGINE — 100 Propriétaires Actifs en 6 mois. Sans core loop fluide, pas de rétention.

---

## Scenario Steps

| Step | Folder | Purpose | Exit Action |
|------|--------|---------|-------------|
| 02.1 | `02.1-dashboard/` | Accéder à la grille d'actions rapides | Tape une action → Quick Log |
| 02.2 | `02.2-quick-log-selection/` | Sélectionner l'animal | Confirme → écran confirmation |
| 02.3 | `02.3-quick-log-confirmation/` | Feedback + options discrètes | Ignore (auto) ou ajoute détail → enregistré ✓ |

**Step 02.1** inclut le contexte d'entrée complet (Q3 + Q4 + Q5 + Q6).
