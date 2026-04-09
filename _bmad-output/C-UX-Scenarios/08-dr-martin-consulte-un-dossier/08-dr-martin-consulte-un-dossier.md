# 08 : Dr. Martin consulte un dossier patient

**Project:** Sakapuss
**Created:** 2026-04-08
**Method:** Whiteport Design Studio (WDS)
**Design Intent:** D (Dream Up)
**Design Status:** not-started

---

## Transaction (Q1)

**What this scenario covers:**
Dr. Martin recherche "Pixel" dans son portail cabinet et accède au dossier complet en moins de 30 secondes — pendant que Camille est en consultation face à lui.

---

## Business Goal (Q2)

**Goal:** BG1 — Réseau vétérinaires + Monétisation
**Objective:** Dr. Martin voit la valeur concrète du portail → recommande Sakapuss à ses clients → nouveaux Camille. Retour sur investissement du flywheel.

---

## User & Situation (Q3)

**Persona:** Dr. Martin le Praticien (Tertiary)
**Situation:** Dr. Martin est en consultation avec Camille. Il ouvre son portail Sakapuss sur son ordinateur de bureau, recherche "Pixel", et consulte le dossier pendant qu'elle est là. Chaque seconde perdue est visible.

---

## Driving Forces (Q4)

**Hope:** Trouver le contexte complet de Pixel en 30 secondes — alertes, retards de traitement, poids, alimentation, comportements — sans que Camille ait à tout réexpliquer oralement.

**Worry:** Perdre du temps à naviguer dans l'interface pendant la consultation — donner l'impression d'être moins efficace qu'avant Sakapuss.

---

## Data Quality Design — Catégories Système

Catégories système prédéfinies (A1) — extensibles selon les besoins :

| Catégorie | Portail vet (défaut) |
|-----------|----------------------|
| Santé | ✅ visible |
| Poids | ✅ visible |
| Alimentation | ✅ visible |
| Litière | ✅ visible |
| Comportement | ✅ visible |
| Événement libre | ✅ visible |
| Rappels | ✅ visible |
| Activité | ❌ masquée par défaut |

Filtre "tout afficher" disponible. Signal médical propre par défaut — pas de bruit d'activité routinière.

---

## Device & Starting Point (Q5 + Q6)

**Device:** Desktop — ordinateur de bureau au cabinet
**Entry:** Dr. Martin ouvre son portail Sakapuss depuis son navigateur (favori), se connecte à son compte cabinet, recherche directement "Pixel".

---

## Best Outcome (Q7)

**User Success:** Dr. Martin trouve le dossier de Pixel en 30 secondes — alertes actives, retards de traitement, poids récent, timeline filtrée. La consultation commence avec tout le contexte déjà là.

**Business Success:** Dr. Martin gagne 3-5 minutes sur l'anamnèse, perçoit la valeur concrète — recommande Sakapuss à ses prochains clients. Le flywheel tourne.

---

## Shortest Path (Q8)

1. **Dashboard cabinet** — Dr. Martin ouvre son portail, tape "Pixel" dans la recherche. Il voit Pixel dans la liste de ses patients → tape dessus.
2. **Dossier patient** — Résumé rapide en haut :
   - Alertes actives (anomalies statistiques détectées : "poids en baisse depuis 3 semaines")
   - Retards de traitement (rappels en retard non validés : "vermifuge — 12 jours de retard")
   - Dernier poids, dernière visite, rappels actifs
   - Timeline filtrée par défaut (catégories médicales)

   Contexte complet en 30 secondes. ✓

*Storyboard items :*
- *Filtre "tout afficher" (active Activité et autres catégories masquées)*
- *Graphique de poids accessible depuis le dossier*
- *"Ajouter à mon portail" si patient pas encore lié*

---

## Trigger Map Connections

**Persona:** Dr. Martin le Praticien (Tertiary)

**Driving Forces Addressed:**
- ✅ **Want:** Accéder à l'historique réel du patient avant/pendant la consultation
- ✅ **Want:** Réduire le temps de reconstitution d'historique
- ❌ **Fear:** Perdre du temps sur une interface complexe pendant une consultation

**Business Goal:** BG1 — Réseau vétérinaires — valeur perçue → recommandation → flywheel.

---

## Scenario Steps

| Step | Folder | Purpose | Exit Action |
|------|--------|---------|-------------|
| 08.1 | `08.1-dashboard-cabinet/` | Rechercher Pixel dans le portail | Tape sur Pixel → dossier |
| 08.2 | `08.2-dossier-patient/` | Contexte complet en 30 secondes | Consultation commence ✓ |

**Step 08.1** inclut le contexte d'entrée complet (Q3 + Q4 + Q5 + Q6).
