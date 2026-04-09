# 04 : Camille consulte l'historique

**Project:** Sakapuss
**Created:** 2026-04-08
**Method:** Whiteport Design Studio (WDS)
**Design Intent:** D (Dream Up)
**Design Status:** not-started

---

## Transaction (Q1)

**What this scenario covers:**
Camille consulte l'historique de ses animaux pour comprendre un pattern ou vérifier une évolution — et repart rassurée plutôt qu'anxieuse.

---

## Business Goal (Q2)

**Goal:** BG0 — THE ENGINE : 100 Propriétaires Actifs en 6 mois
**Objective:** Valeur perçue qui ancre la rétention. L'historique visuel transforme "une app de saisie" en "ma mémoire animale". Sans valeur visible après 4 semaines, Camille part.

---

## User & Situation (Q3)

**Persona:** Camille la Gardienne (Primary)
**Situation:** Camille est chez elle (soir ou week-end). Elle remarque que Pixel mange moins, ou son vétérinaire lui a demandé "il a perdu du poids depuis quand ?". Elle ouvre Sakapuss pour vérifier plutôt que de fouiller sa mémoire. Elle peut aussi vouloir envoyer le lien directement à son vétérinaire depuis cette vue.

---

## Driving Forces (Q4)

**Hope:** Voir le graphique de poids et comprendre "il perd du poids depuis 3 semaines" — l'historique remplace l'incertitude par des faits.

**Worry:** Ne pas avoir assez de données pour voir une tendance claire, ou ne pas comprendre ce que les données lui disent.

---

## Design Principle — Valeur Historique Progressive

> Le pattern saisonnier (ex: perte de poids chaque printemps) nécessite ~12 mois de données. La valeur historique est **progressive** :
> - Semaines 1-4 : tendances récentes visibles (depuis quand il mange moins ?)
> - Mois 2-6 : corrélations émergentes (changement de nourriture → perte de poids ?)
> - Mois 12+ : patterns saisonniers reconnaissables → sérénité totale

Les anomalies viennent à Camille — pas elle qui cherche. Corrélations et patterns détectés visuellement, mis en évidence proactivement.

---

## Device & Starting Point (Q5 + Q6)

**Device:** Mobile-first, desktop pertinent pour l'analyse approfondie (graphiques enrichis sur grand écran)
**Entry:** Camille ouvre Sakapuss depuis son téléphone (ou son ordinateur le soir), navigue vers l'historique de Pixel depuis le Dashboard ou le profil animal.

---

## Best Outcome (Q7)

**User Success:** Camille voit le graphique de poids de Pixel sur les dernières semaines, comprend depuis quand la tendance baissière a commencé — et repart rassurée ou partage la timeline directement avec son vétérinaire depuis l'app.

**Business Success:** La valeur historique est visible avant 4 semaines de données — Camille comprend pourquoi continuer à saisir. La rétention long terme est confirmée.

---

## Shortest Path (Q8)

1. **Timeline / Historique** — Camille ouvre l'historique de Pixel. Fil chronologique de toutes les saisies, filtrable par type (poids, alimentation, événements libres...).
2. **Graphique de poids** — Elle tape sur la courbe de poids, voit l'évolution sur les dernières semaines. Une tendance baissière est visible — elle comprend depuis quand ça a commencé.
3. **Profil animal** — Fiche complète de Pixel : rappels actifs, dernières visites, infos de base. Option "Partager avec mon vétérinaire" accessible depuis cette vue. ✓

*Storyboard items :*
- *Filtres timeline (par type d'événement, par période)*
- *Anomalies détectées visuellement (mise en évidence proactive)*
- *Bouton "Partager avec mon vétérinaire" (anticipe scénario 07)*
- *Vue desktop enrichie (graphiques plus détaillés, multi-animaux)*
- *Promesse long terme : patterns saisonniers après 12 mois de données*

---

## Trigger Map Connections

**Persona:** Camille la Gardienne (Primary)

**Driving Forces Addressed:**
- ✅ **Want:** Comprendre les patterns de santé sans anxiété
- ❌ **Fear:** Rater un signal important et le réaliser trop tard

**Business Goal:** BG0 — THE ENGINE — valeur perçue qui ancre la rétention à 4 semaines et au-delà.

---

## Scenario Steps

| Step | Folder | Purpose | Exit Action |
|------|--------|---------|-------------|
| 04.1 | `04.1-timeline-historique/` | Voir le fil chronologique de Pixel | Tape sur la courbe de poids → graphique |
| 04.2 | `04.2-graphique-de-poids/` | Comprendre la tendance récente | Tape sur profil → fiche complète |
| 04.3 | `04.3-profil-animal/` | Vue complète + option partage vétérinaire | Partage ou ferme l'app ✓ |

**Step 04.1** inclut le contexte d'entrée complet (Q3 + Q4 + Q5 + Q6).
