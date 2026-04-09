---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9]
inputDocuments: ['prd.md', 'product-brief-sakapuss-2026-02-27.md', 'architecture.md', 'brainstorming-session-2026-03-04.md']
---

# UX Design Specification Sakapuss

**Author:** Charchess
**Date:** 2026-03-04

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

### Project Vision
Sakapuss est un "Hub de Santé Animalier intelligent" qui transforme le carnet de santé traditionnel en un outil proactif et collaboratif. Sa force réside dans sa capacité à capturer des données de santé précises avec un effort minimal, tout en s'intégrant nativement dans l'écosystème domotique de l'utilisateur (Home Assistant).

### Target Users
- **L'Administrateur Technique (Alex)** : Installe via Docker, configure MQTT et veut un accès rapide aux données brutes.
- **L'Utilisateur Quotidien (Maman)** : Principalement sur mobile, cherche l'autonomie totale pour noter un nettoyage de litière ou un repas sans friction.
- **Le Professionnel de Santé (Vétérinaire)** : Lecteur passif mais critique, nécessite une vue "Timeline" filtrable et ultra-rapide.

### Key Design Challenges
- **Design du "1-tap"** : Concevoir un arbre de sélection par icônes qui anticipe les besoins de l'utilisateur sans le surcharger d'options.
- **Réactivité MQTT** : L'interface doit refléter instantanément les validations faites via Assistant Vocal ou Home Assistant.
- **Accessibilité Mobile-First** : Une interface haute-fidélité, contrastée et tactile, optimisée pour un usage à une main (pendant qu'on nettoie une litière, par exemple).

### Design Opportunities
- **Intelligence Invisible** : Utiliser le moteur de corrélation pour pousser des insights UX (ex: "Vous avez noté 3 diarrhées cette semaine, voulez-vous envoyer le rapport au véto ?").
- **Intégration HA Native** : Proposer un design qui s'adapte esthétiquement aux dashboards Home Assistant.

## Core User Experience

### Defining Experience
L'expérience Sakapuss se définit comme une "extension cognitive" de la routine de soin animale. Elle ne doit pas être perçue comme une application de saisie, mais comme un témoin silencieux qui transforme des gestes quotidiens en un historique de santé structuré.

### Platform Strategy
- **Responsive Web App (SvelteKit)** : Le centre de contrôle complet, optimisé pour Chrome/Safari on iOS and Android.
- **MQTT / HA Ingress** : Interface de consultation rapide intégrée au mur domotique.
- **Voice Control** : Canal de validation sans contact pour les rappels de traitement.

### Effortless Interactions
- **L'Arbre de Décision 1-tap** : Une grille d'icônes contextuelles (ex: si je clique sur "Litière", je vois des icônes de selles).
- **Auto-save "RAS"** : Enregistrement automatique après 3 secondes d'inactivité sur un écran de log si aucune anomalie n'est cochée.

### Critical Success Moments
- **La première corrélation** : Quand l'app alerte : "Minou a eu 3 diarrhées depuis le changement de croquettes il y a 2 jours".
- **Le partage Vétérinaire** : Générer un lien temporaire en urgence qui affiche instantanément les 3 derniers mois de santé.

### Experience Principles
1. **Zéro Texte Obligatoire** : La saisie doit pouvoir être 100% iconographique.
2. **Contexte Perpétuel** : Toujours afficher la dernière pesée et le dernier soin en haut de l'écran animal.
3. **Esthétique Domotique** : Design sobre, utilisant les variables CSS de HA pour une intégration visuelle parfaite.

## Desired Emotional Response

### Primary Emotional Goals
L'objectif est de transformer l'anxiété liée à la santé animale en un sentiment de **maîtrise sereine**. L'utilisateur doit se sentir soutenu par un assistant intelligent et non jugé par un carnet de notes vide.

### Emotional Journey Mapping
- **Découverte** : Curiosité et soulagement ("Enfin un outil sérieux et local").
- **Usage Quotidien** : Automatisme sans friction (Satisfaction du devoir accompli en 2 secondes).
- **Crise / Consultation** : Calme et efficacité ("J'ai tout ce qu'il faut sous la main pour le véto").
- **Récurrence** : Attachement et confiance (L'app devient la mémoire vive de la santé de l'animal).

### Micro-Emotions
- **Confiance** renforcée par le disclaimer médical et la précision des logs.
- **Accomplissement** lors de la validation d'un rappel HA.
- **Sérénité** apportée par le design sobre et l'absence de "dark patterns" ou de notifications anxiogènes.

### Design Implications
- **Confiance** → Utilisation d'une typographie lisible, de couleurs sobres (bleu santé/gris doux) et de graphiques précis.
- **Sérénité** → Espaces aérés (Whitespace), animations fluides (non saccadées), pas de boutons de panique rouges inutiles.
- **Accomplissement** → Feedback visuel immédiat (micro-animation) lors d'une saisie "1-tap".

### Emotional Design Principles
1. **Le Design comme Ancre** : Dans l'urgence, l'interface doit rester stable et prévisible.
2. **Empathie Technique** : L'app reconnaît les efforts de l'utilisateur (ex: "Historique à jour, bon travail !").
3. **Zéro Surprise Négative** : Pas de perte de données, pas de bugs d'affichage MQTT.

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis
- **Apple Health** : Maîtrise de la densité d'information. On en retiendra la "Summary View" qui met en avant les changements (ex: "Poids en baisse").
- **WaterMinder** : L'excellence de la saisie répétitive. On s'inspirera de la grille d'icônes circulaires pour les logs rapides (Litière, Nourriture).
- **Home Assistant (Mushroom Cards)** : L'esthétique de la domotique moderne. Boutons arrondis, contrastés, avec un feedback tactile (Haptic feedback) simulé.

### Transferable UX Patterns
- **Decision Tree Navigation** : Utiliser un pattern de "Drill-down" visuel (clic sur Categorie → choix sous-categorie) sans changer de page (overlay ou tiroir/drawer).
- **Temporal Sorting** : Timeline inversée (plus récent en haut) avec "Sticky headers" pour les dates.
- **Dynamic Icons** : Icônes qui changent de couleur selon l'état (ex: rouge si le vaccin est dépassé).

### Anti-Patterns to Avoid
- **Formulaires à rallonge** : Bannir les champs de texte obligatoires sur mobile.
- **Hiérarchie plate** : Éviter de mettre toutes les infos au même niveau (ex: ne pas mélanger une pesée mensuelle et un log de litière quotidien sans distinction visuelle).
- **Navigation profonde** : Ne jamais être à plus de 2 clics de l'action de log.

### Design Inspiration Strategy
La stratégie consiste à fusionner la rigueur d'une application de santé (Apple Health) avec la rapidité d'un outil de tracking (WaterMinder), le tout encapsulé dans un langage visuel compatible avec Home Assistant.

## Design System Foundation

### 1.1 Design System Choice
**Tailwind-based Adaptive System**. Nous utiliserons Tailwind CSS pour la mise en page et le styling, complété par une bibliothèque de composants légère et thémable (type Skeleton ou Headless UI pour Svelte).

### Rationale for Selection
- **Performance** : Crucial pour l'auto-hébergement sur des serveurs type Raspberry Pi.
- **Accessibilité** : Facilité de créer des contrastes élevés pour les utilisateurs non-techniques (Maman).
- **Consistance HA** : Permet d'injecter facilement les variables CSS de Home Assistant (`--primary-color`, `--card-background-color`) pour un mode "Ingress" transparent.

### Implementation Approach
- **Mobile-First Utility Classes** : Priorité absolue aux layouts verticaux et tactiles.
- **Design Tokens** : Centralisation des couleurs (Bleu Santé, Gris Doux) et des espacements (Grille de 8px).
- **SVG-First Icons** : Utilisation exclusive d'icônes SVG légères (Lucide Icons ou Material Design Icons) pour l'arbre de décision.

### Customization Strategy
Le système sera "thémable" dynamiquement. Si l'utilisateur change de thème dans Home Assistant, Sakapuss doit s'adapter automatiquement en utilisant les variables CSS injectées par le header HA.

## 2. Core User Experience

### 2.1 Defining Experience
**"L'Arbre de Log 1-tap"**. L'interaction centrale consiste à capturer un événement de vie ou de santé animale via une navigation iconographique ultra-rapide, éliminant toute saisie textuelle pour les actions quotidiennes.

### 2.2 User Mental Model
L'utilisateur ne veut pas "remplir un formulaire", il veut "marquer une action faite". Le modèle mental est celui d'une liste de tâches (Checklist) qui se transforme dynamiquement en journal de bord.

### 2.3 Success Criteria
- **Log Routine** : Temps de complétion < 3s.
- **Zéro Clavier** : 100% des actions P0 réalisables sans ouvrir le clavier mobile.
- **Feedback Haptique** : Confirmation sensorielle de l'enregistrement (vibration/visuel).

### 2.4 Novel UX Patterns
- **Contextual Grid Expansion** : Une grille qui ne change pas de page mais s'étend verticalement pour révéler des détails (évite la désorientation).
- **Auto-Dismiss Timer** : Fermeture automatique de l'interface de log après succès pour ramener l'utilisateur à sa timeline.

### 2.5 Experience Mechanics
1. **Trigger** : Tap sur l'icône "Fast Action" depuis le dashboard.
2. **Action** : Sélection par icônes (Système de nœuds simples).
3. **Validation** : Bouton "Save" proéminent (ou auto-save si option activée).
4. **Outcome** : Injection immédiate dans la timeline avec animation de descente.

## Visual Design Foundation

### Color System
Le système de couleurs "Calm Health" est conçu pour réduire l'anxiété.
- **Primary (Confiance)** : Indigo (#1A56DB). Utilisé pour les actions principales et la navigation.
- **Success (Santé)** : Emerald (#10B981). Utilisé pour les logs "RAS" et les états validés.
- **Warning (Attention)** : Amber (#F59E0B). Utilisé pour les rappels imminents.
- **Neutral** : Slate (Gris ardoise). Support complet du mode Dark/Light via les variables CSS de HA.

### Typography System
- **Typeface** : Inter (Standard moderne, hautement lisible).
- **Hierarchy** :
  - H1 : 24px Bold (Titres animaux)
  - H2 : 18px Semi-Bold (Sections timeline)
  - Body : 16px Regular (Informations de santé)
  - Caption : 12px Medium (Dates et tags)

### Spacing & Layout Foundation
- **Base Unit** : 8px.
- **Card Design** : Fond blanc/gris-foncé, ombre portée très légère, arrondis de 16px pour un aspect "douillet" et moderne.
- **Touch Targets** : Tous les boutons interactifs font au minimum 48x48px pour respecter les standards d'accessibilité mobile.

### Accessibility Considerations
- **Contraste** : Ratio minimal de 4.5:1 pour tout texte informatif.
- **Indicateurs doubles** : Ne jamais utiliser uniquement la couleur pour transmettre une info (ex: une alerte aura une couleur orange ET une icône d'avertissement).

## Design Direction Decision

### Design Directions Explored
Nous avons exploré trois directions majeures :
1.  **Dashboard First** : Une grille de cartes d'état pour une vue d'ensemble rapide.
2.  **Timeline Stream** : Un flux chronologique pour l'historique détaillé.
3.  **1-Tap Mobile** : Une interface d'action pure centrée sur la saisie.

### Chosen Direction
**Hybrid Dashboard & 1-Tap Approach**. L'application utilisera la **Direction 1 (Dashboard)** comme écran d'accueil par animal pour donner le contexte immédiat (dernier poids, prochain vaccin), et la **Direction 3 (1-Tap)** comme modal/overlay principal pour toute saisie de données. La **Direction 2 (Timeline)** restera accessible via un onglet dédié pour les consultations approfondies.

### Design Rationale
Cette approche hybride satisfait les deux profils d'utilisateurs : "Alex" a ses indicateurs d'état sur le dashboard, et "Maman" a son interface de saisie ultra-rapide sans friction.

### Implementation Approach
- **Home Screen** : Widgets de type Mushroom pour les constantes de santé.
- **Primary Action** : Bouton flottant (FAB) ouvrant la grille 1-tap.
- **Secondary View** : Flux vertical polymorphe pour la timeline complète.
