# Product Concept Dialog

**Step:** 07a — Product Concept
**Completed:** 2026-04-07
**Status:** confirmed

---

## Opening

**Question:** "Quel est l'axe central de Sakapuss — centré animal, centré temps, ou centré action ?"

**User response:** "sakapuss est centré sur les 3 mais le point d'entrée est l'action (et l'observation)"

**Signal:** 3 axes coexistent, mais la hiérarchie UX est claire : action-first.

---

## Key Exchanges

**Q:** Pourquoi action-first plutôt qu'animal-first ?

**A:** "l'utilisation de sakapuss doit devenir une seconde nature pour noter ce que j'ai vu ou fait. il peut y avoir plusieurs animaux, donc se baser sur un animal ne me semble pas pertinent"

**Signal:** Deux raisons distinctes — (1) habitude/réflexe (vitesse de saisie) et (2) multi-animaux (friction évitée).

---

## Reflection Checkpoint

**Synthesis présentée:**
> "Journal de bord à entrée rapide. Point de départ = action/observation, pas l'animal. L'utilisateur note, rattache à l'animal, Sakapuss construit timeline et dossier en arrière-plan. Saisie = réflexe. Consultation riche = couche secondaire."

**User response:** "oui" ✅ Confirmed first try.

---

## Product Concept

**Core Structural Idea:** Journal de bord à entrée rapide (log-first)

**Implementation Principle:**
L'interface principale est une surface de capture rapide centrée sur l'action ou l'observation. L'animal est un attribut du log, pas le point d'entrée. La richesse (timeline, dossier par animal, corrélations) émerge de l'agrégation des logs.

**Rationale:**
- Multi-animaux = choisir l'animal d'abord crée de la friction
- L'usage doit être un réflexe conditionné — "noter" comme geste naturel, pas comme navigation dans un CRM
- La valeur long-terme (patterns, historique) est une conséquence de la régularité de saisie — donc tout ce qui réduit la friction augmente la valeur du produit

**Concrete Example:**
Utilisateur vient de nettoyer la caisse → ouvre Sakapuss → tape "caisse nettoyée" ou clique l'icône → sélectionne le chat concerné → done en 3 secondes. La timeline de Pixel se met à jour en arrière-plan.

**Features That Stem From This Concept:**
- Grille d'actions rapides en écran d'accueil (pas de navigation vers un animal d'abord)
- Saisie d'événements libres datés (même principe — log d'observation)
- Attribution à l'animal = étape secondaire dans le flux de saisie
- Consultation riche accessible mais pas point d'entrée
- Notifications proactives = le système vient vers l'utilisateur quand nécessaire (inverse de la saisie)
