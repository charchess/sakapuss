# 03 : Camille valide un rappel

**Project:** Sakapuss
**Created:** 2026-04-08
**Method:** Whiteport Design Studio (WDS)
**Design Intent:** D (Dream Up)
**Design Status:** not-started

---

## Transaction (Q1)

**What this scenario covers:**
Camille reçoit un rappel pour un soin à faire, l'effectue, le valide dans Sakapuss, et voit le prochain rappel planifié automatiquement — le cycle se ferme.

---

## Business Goal (Q2)

**Goal:** BG0 — THE ENGINE : 100 Propriétaires Actifs en 6 mois
**Objective:** Le "moment de vérité" — quand Camille valide son premier rappel et voit "Vermifuge de Pixel ✓ — prochain dans 3 mois", elle comprend que le système fonctionne. Ce moment = rétention long terme activée.

---

## User & Situation (Q3)

**Persona:** Camille la Gardienne (Primary)
**Situation:** Camille vient de donner le vermifuge à Pixel, téléphone en main. Elle a reçu une notification push "Vermifuge de Pixel — aujourd'hui" et tape dessus pour valider l'action.

---

## Driving Forces (Q4)

**Hope:** Valider en 2 taps et voir le prochain rappel planifié automatiquement — la boucle se ferme toute seule.

**Worry:** Rater un rappel parce qu'elle n'a pas vu la notification, ou oublier de valider après avoir fait le soin — et que le système ne relance pas.

---

## Reminder Lifecycle — Flow Nominal

**J-7 (configurable) :** Notification d'anticipation actionnable → "Vermifuge de Pixel dans 7 jours — pensez à commander / prendre RDV". Tape dessus → ouvre le détail du rappel (contexte visible, produit, fréquence). Pas d'action requise.

**Jour J :** Notification → "Vermifuge de Pixel aujourd'hui". Ouvre directement le détail avec deux actions :
- **Done** → cycle fermé, prochain rappel planifié automatiquement ✓ *(sunshine path)*
- **Postpone** → délais standardisés (+3j, +1 sem, +2 sem) *(storyboard item)*

**Règle fondamentale :** Un rappel non validé reste visible dans la liste et ne disparaît jamais silencieusement.

---

## Strategic Note — Notifications Vétérinaire

> Permettre au propriétaire de notifier son cabinet avant un RDV — "Pixel vient pour son vaccin jeudi, tenez le Feligen prêt." Levier d'adoption cabinet fort : Dr. Martin reçoit de la valeur opérationnelle concrète avant même la consultation. À évaluer Phase 1 ou 2.

---

## Device & Starting Point (Q5 + Q6)

**Device:** Mobile
**Entry:** Camille reçoit une notification push le jour J. Elle vient de donner le vermifuge à Pixel, tape sur la notification → ouvre directement le détail du rappel.

---

## Best Outcome (Q7)

**User Success:** Camille tape "Done", voit "Vermifuge de Pixel ✓ — prochain dans 3 mois" — le cycle se ferme, le suivant est planifié automatiquement. Elle peut fermer l'app sans rien d'autre à faire.

**Business Success:** Premier cycle de rappel complet validé — Camille a vécu la promesse fondamentale du système. La rétention long terme est activée.

---

## Shortest Path (Q8)

1. **Liste des rappels** — Camille arrive depuis la notification push (ou ouvre l'app et voit le bandeau rappel en attente). Elle voit "Vermifuge de Pixel — aujourd'hui".
2. **Rappel détail + validation** — Contexte complet (type, date, produit). Elle tape "Done" → "Vermifuge de Pixel ✓ — prochain dans 3 mois". ✓

*Storyboard items étape 2 :*
- *Notification J-7 : ouvre le même détail, informe, pas d'action requise*
- *Postpone : délais standardisés (+3j, +1 sem, +2 sem)*
- *Rappel non validé : reste visible dans la liste jusqu'à action explicite*

---

## Trigger Map Connections

**Persona:** Camille la Gardienne (Primary)

**Driving Forces Addressed:**
- ✅ **Want:** Ne plus jamais oublier un soin important
- ❌ **Fear:** Rater un signal important et le réaliser trop tard

**Business Goal:** BG0 — THE ENGINE — moment de vérité de la rétention. Sans ce cycle complet vécu, pas d'engagement long terme.

---

## Scenario Steps

| Step | Folder | Purpose | Exit Action |
|------|--------|---------|-------------|
| 03.1 | `03.1-liste-des-rappels/` | Voir le rappel en attente | Tape sur le rappel → détail |
| 03.2 | `03.2-rappel-detail-validation/` | Valider le soin effectué | Tape "Done" → cycle fermé ✓ |

**Step 03.1** inclut le contexte d'entrée complet (Q3 + Q4 + Q5 + Q6).
