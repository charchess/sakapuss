# 09 : Camille passe au premium

**Project:** Sakapuss
**Created:** 2026-04-08
**Method:** Whiteport Design Studio (WDS)
**Design Intent:** D (Dream Up)
**Design Status:** not-started

> ⚠️ **Statut : Phase 2 — Non prioritaire au lancement**
> Ce scénario est documenté pour cadrer la vision premium. L'implémentation est prévue en Phase 2, après stabilisation du core loop gratuit.

---

## Transaction (Q1)

**What this scenario covers:**
Camille consulte ses insights du mois, atteint la limite gratuite, voit la valeur de ce qu'elle ne peut plus voir, et s'abonne au premium.

---

## Business Goal (Q2)

**Goal:** BG1 — Réseau vétérinaires + Monétisation
**Objective:** 10% de conversion premium parmi les Propriétaires Actifs — première source de revenu récurrente.

---

## User & Situation (Q3)

**Persona:** Camille la Gardienne (Primary)
**Situation:** Camille utilise Sakapuss depuis plusieurs semaines. Elle a pris l'habitude de consulter ses insights. Ce mois-ci, elle a utilisé ses insights gratuits et tombe sur le message "vous avez atteint votre limite mensuelle".

---

## Driving Forces (Q4)

**Hope:** Accéder à la corrélation qu'elle entrevoit — comprendre pourquoi Pixel mange moins depuis 3 semaines vaut bien un abonnement mensuel.

**Worry:** Payer pour quelque chose qui ne tient pas ses promesses, ou se retrouver avec un abonnement qu'elle oublie d'annuler.

---

## Freemium Model — Logique A (Quota Mensuel)

> La base gratuite est genuinement utile — pas un produit castré. Le premium amplifie ce qui marche déjà.

**Gratuit (illimité) :**
- Log-first quotidien
- Rappels complets avec cycle de validation
- Timeline et historique complet
- Partage vétérinaire
- Multi-utilisateurs foyer
- Insights analytics : quota mensuel (ex: 2/mois)

**Premium :**
- Insights analytics illimités
- Corrélations multi-facteurs (poids / alimentation / litière / comportement / marques)
- Historique étendu (si applicable)

**Dosage quota :** Assez généreux pour créer la valeur, assez limité pour motiver la conversion. À calibrer selon les données d'usage réelles.

> ⚠️ **Note :** Le quota exact (ex: 2/mois) est à valider par les données d'usage en Phase 2.

---

## Device & Starting Point (Q5 + Q6)

**Device:** Mobile
**Entry:** Camille est dans l'app, section analytics. Elle consulte ses insights du mois, voit le message de limite mensuelle atteinte.

---

## Best Outcome (Q7)

**User Success:** Camille s'abonne, accède immédiatement à la corrélation qui l'a motivée, et comprend pourquoi Pixel mange moins — l'abonnement se justifie dès la première minute.

**Business Success:** Première conversion premium — BG1 amorcé. Revenu récurrent + signal fort d'engagement long terme.

---

## Shortest Path (Q8)

1. **Analytics / Corrélations** — Camille consulte ses insights du mois. Elle voit un aperçu partiel d'une corrélation disponible. Message : "Vous avez utilisé vos 2 insights gratuits ce mois-ci."
2. **Upgrade / Abonnement** — Présentation du premium : insights illimités, corrélations multi-facteurs. Prix, fréquence, annulation facile visible dès cette page. Elle s'abonne → accès immédiat à la corrélation. ✓

*Storyboard items :*
- *Aperçu partiel de la corrélation (donne envie sans frustrer)*
- *Annulation simple visible dès la page d'abonnement (réduit la crainte)*
- *Retour immédiat sur la corrélation après souscription*

---

## Trigger Map Connections

**Persona:** Camille la Gardienne (Primary)

**Driving Forces Addressed:**
- ✅ **Want:** Insights proactifs / corrélations multi-facteurs
- ❌ **Fear:** Payer pour quelque chose qui ne tient pas ses promesses

**Business Goal:** BG1 — Monétisation — 10% conversion premium, revenu récurrent.

---

## Scenario Steps

| Step | Folder | Purpose | Exit Action |
|------|--------|---------|-------------|
| 09.1 | `09.1-analytics-correlations/` | Atteindre la limite gratuite, voir la valeur | Tape "Voir le premium" |
| 09.2 | `09.2-upgrade-abonnement/` | Comprendre l'offre et s'abonner | Abonnement souscrit → corrélation accessible ✓ |

**Step 09.1** inclut le contexte d'entrée complet (Q3 + Q4 + Q5 + Q6).
