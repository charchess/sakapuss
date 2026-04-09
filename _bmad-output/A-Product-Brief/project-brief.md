# Project Brief: Sakapuss

> Complete Strategic Foundation

**Created:** 2026-04-07
**Author:** Charchess
**Brief Type:** Complete

---

## Strategic Summary

Sakapuss est né d'une frustration réelle : des post-it sur le frigo pour les rendez-vous vétérinaires, une feuille Excel pour le poids des chats, et une mémoire qui oublie les dates de vermifuges. Le besoin existe — il n'est juste pas conscient avant d'avoir la donnée. Une fois qu'on sait que ses chats perdent 30% de poids chaque printemps, on ne peut plus ne pas suivre.

Ce que Sakapuss apporte, ce n'est pas une feature de plus dans une app existante — c'est un design principle. **Log-first** : l'entrée naturelle c'est l'action ou l'observation ("j'ai nettoyé la caisse", "Pixel a fait une chute"), pas la navigation vers le profil d'un animal. La richesse — timeline, corrélations, dossier vétérinaire — émerge de la régularité de saisie. Et cette régularité n'est possible que si la saisie est assez rapide pour devenir un réflexe.

La vision à terme est une plateforme publique : cloud pour le grand public, self-hosted open source pour les profils tech, avec un portail vétérinaire gratuit qui crée un flywheel d'acquisition naturel. Et sous-jacent, un dataset de santé animale collectif qui n'existe nulle part ailleurs.

---

## Vision

> "Sakapuss est la mémoire vivante de vos animaux — un hub self-hosted qui transforme les observations quotidiennes du foyer en patterns reconnaissables, pour soigner avec sérénité plutôt qu'avec anxiété."

**Contexte :** La valeur de Sakapuss n'est pas dans la saisie elle-même, mais dans l'historique qu'elle construit. Connaître un pattern saisonnier transforme l'anxiété en sérénité. C'est la donnée historique qui rassure — pas l'app.

---

## Positioning Statement

Pour les propriétaires d'animaux qui veulent dépasser le carnet vétérinaire papier, **Sakapuss est un hub de santé animale complet** qui centralise carnet de santé, suivi alimentaire, litière et rappels en une seule plateforme. Contrairement aux applis de rappels ou aux carnets vétérinaires en ligne limités, Sakapuss intègre tous les aspects du quotidien animal — et s'interface avec Home Assistant pour les foyers connectés — disponible en cloud ou en self-hosted open source.

**Breakdown :**

- **Target Customer :** Propriétaires d'animaux (particuliers), avec vétérinaires comme utilisateurs secondaires institutionnels
- **Need/Opportunity :** Centraliser le suivi santé complet d'un animal — pas juste les rappels, pas juste les visites vétérinaires
- **Category :** Hub de santé animale (pet health management platform)
- **Key Benefit :** Vision complète et historisée, accessible à tout le foyer et partageable avec le vétérinaire
- **Differentiator :** Log-first by design + combinaison unique (carnet de santé + alimentation + litière + rappels + HA) + cloud ou self-hosted open source

---

## Business Model

**Type :** B2C Freemium + potentiel B2B données agrégées

**Couches de monétisation :**
1. **Base gratuite** — tracking, rappels, carnet de santé (cloud)
2. **Premium analytics** — abonnement, corrélations multi-facteurs (poids/litière/nutrition/humeur/marques)
3. **Sync cloud pour self-hosters** — payante, débloque analytics + connectivité vétérinaire
4. **Vétérinaires** — accès gratuit (levier d'acquisition et légitimité)
5. **Crowd-sourcing veille sanitaire** — différenciateur unique, potentiel B2B données agrégées anonymisées à terme

---

## Business Customer Profile (B2B — Vétérinaires)

Cabinets vétérinaires avec portail multi-praticiens. Relation `n:1:m` — plusieurs animaux liés à un cabinet, plusieurs praticiens dans le cabinet.

**Structure du compte :** Manager de compte + comptes associés (accès individuels par praticien).

**Acquisition :** Flywheel bidirectionnel — propriétaires font la pub aux cabinets via leur usage, cabinets recommandent Sakapuss à leurs clients. Prospection initiale sur quelques cabinets pilotes, puis bouche à oreille.

| Rôle | Description |
|------|-------------|
| **Manager** | Responsable du compte cabinet, crée les accès praticiens |
| **Praticien** | Consulte les dossiers patients Sakapuss en consultation |
| **Utilisateur final** | Le propriétaire d'animal (côté B2C) |

---

## Profils Utilisateurs

### Primaire — Le Propriétaire Attentif

Propriétaire d'animaux impliqué qui suit activement la santé de ses chats. Aujourd'hui : post-it frigo, mémoire, oublis coupabilisants. Demain avec Sakapuss : source de vérité unique, alertes proactives, paix d'esprit.

**Usages quotidiens :**
- Note les actions routinières (caisse nettoyée, gamelle remplie, poids)
- Consigne des événements libres datés ("a fait une chute", "refuse sa gamelle")
- Reçoit et valide les rappels (vermifuges, antipuces, RDV vétérinaire)
- Reçoit des alertes proactives (stock faible, pesée à faire)
- Configure le compte et les droits des membres du foyer

### Secondaire — Le Membre du Foyer

Autre personne du foyer (parent, conjoint). Saisit les observations du quotidien. Accès et droits configurables par l'admin ou en self-service. **Besoin UX critique : zéro friction — sinon abandon.**

### Tertiaire — Le Vétérinaire

Consulte l'historique complet du patient (poids, alimentation, comportements, événements, rappels validés) via le portail cabinet. Ne saisit pas de données. Accès gratuit.

---

## Critères de Succès

**Primaire (usage personnel) :**
Sakapuss devient la source de vérité — vision historique fiable, rappels fonctionnels, plus besoin du post-it frigo. Critère qualitatif : l'utilisateur cesse de chercher l'information ailleurs.

**Secondaire (lancement public) :**
- Rétention comportementale : saisies régulières sur **4 semaines consécutives** = utilisateur actif
- Signal d'engagement fort : **présence de rappels configurés** = l'utilisateur fait confiance à Sakapuss pour quelque chose qui compte (au-delà du simple essai)

**Priorité :** Usage personnel d'abord, puis rétention publique.

---

## Paysage Concurrentiel

**Ce que les gens utilisent aujourd'hui :**
- Notes téléphone / post-it frigo / carnet papier — bonne intention, mauvaise friction
- Excel (suivi poids depuis la naissance, mais nécessite d'aller à l'ordinateur)
- Do-nothing — le plus fréquent (besoin non conscient avant d'avoir la donnée)
- Tractive — GPS, pas orienté santé quotidienne
- Portails vétérinaires — limités aux visites, pas au quotidien

**Pourquoi ils restent avec ces alternatives :**
Pas par choix rationnel — par inertie. Le besoin n'est pas conscient avant d'avoir la donnée. Une fois qu'on sait que ses chats perdent 30% de poids chaque printemps, on ne peut plus ne pas suivre.

### Notre Avantage Non Copiable

**Log-first by design.** Un concurrent (Tractive, portail vétérinaire) qui ajouterait le suivi alimentaire aurait le mauvais point d'entrée, la mauvaise UX, le mauvais mental model. La capture "as-you-go" sans friction est l'essence de Sakapuss — pas une feature.

**Dataset collectif unique.** Le crowd-sourcing de données de santé animale anonymisées (veille sanitaire géographique, corrélations populationnelles) est une couche que personne n'a encore construite.

---

## Contraintes & Contexte

| Paramètre | Valeur |
|-----------|--------|
| **Timeline** | Pas d'échéance — quality-driven |
| **Budget externe** | 0€ |
| **Infrastructure** | Homelab Kubernetes disponible (déploiement production réel sans coût cloud) |
| **Équipe** | Solo |
| **Stack** | Flexible (FastAPI + SvelteKit actuellement, non définitivement arrêté) |

**Atout :** Le homelab k8s permet d'itérer en production réelle sans coût, et le créateur est l'utilisateur cible — validation quotidienne de l'usage réel.

---

## Stratégie Plateforme

**Primary Platform :** Responsive Web App (PWA envisageable à court terme)

**Device Priority :** Mobile-first — la saisie quotidienne se fait sur téléphone. Desktop = couche consultation secondaire.

**Interaction Models :** Touch (mobile, tablette) + Mouse/keyboard (desktop consultation)

**Offline :** Connected-first. Offline = nice-to-have v2.

**Future Plans :** App native mobile possible (introduit complexité sync — non prioritaire).

**Design Implications :**
- UI conçue pour le pouce, pas la souris
- Touch targets ≥ 44px
- Chargement rapide sur réseau variable
- PWA : notifications push sans app store

---

## Ton de Voix

**Pour l'UI Microcopy & les Messages Système**

### Attributs

1. **Chaleureux & bienveillant** — L'app parle à des gens qui aiment leurs animaux. Le ton reflète cet attachement sans être mièvre.
2. **Direct & efficace** — Labels courts, actions claires. La saisie doit être un réflexe, pas une interface à déchiffrer.
3. **Rassurant** — Les alertes informent calmement. Le ton ne panique pas, il guide.
4. **Sobre** — Pas d'exclamations ou d'emojis excessifs. Sakapuss prend soin d'animaux, ce n'est pas une appli de gaming.

### Cycle de Vie des Rappels

| État | Message |
|------|---------|
| À venir | "Vermifuge de Pixel dans 7 jours — pensez à prendre rendez-vous" |
| Imminent | "Vermifuge de Pixel demain — tout est prêt ?" |
| En retard | "Vermifuge de Pixel — en attente de validation" |
| Validé | "Vermifuge de Pixel ✓ — prochain dans 6 mois" |

**Règle fondamentale :** Un rappel non validé reste visible jusqu'à confirmation explicite. Il ne disparaît jamais silencieusement.

### Exemples Microcopy

| Contexte | ✅ Sakapuss | ❌ Générique |
|----------|------------|-------------|
| Bouton saisie | "Enregistrer" | "Submit" |
| Stock faible | "Il reste peu de croquettes — pensez à commander" | "Warning: stock low" |
| État vide | "Rien encore — notez votre première observation" | "No events" |
| Erreur | "Quelque chose cloche — vérifiez les informations" | "Invalid input" |

### Guidelines

**Do :** Phrases courtes. Langage naturel. Toujours actionnable. Anticiper avant d'alerter.

**Don't :** Jargon médical. Notifications alarmistes. Messages trop techniques. Rappels qui disparaissent sans validation.

---

## Intégration Home Assistant

**Rôle :** Interfaçage, pas feature centrale. HA gère les notifications et l'affichage de données (poids, âge, prochain rappel) — Sakapuss reste le cerveau.

**Flux cible :** Téléphone (saisie) → Sakapuss (agrégation) → Home Assistant (notification + dashboard)

**Statut :** Nice-to-have / side quest — précieux pour les foyers HA, pas bloquant pour le lancement.

---

## Next Steps

- [ ] **Phase 2 : Trigger Mapping** — Cartographier les scénarios utilisateurs clés
- [ ] **Phase 3 : Content & Language** — Stratégie de contenu et langues
- [ ] **Phase 4 : Visual Direction** — Direction visuelle et design system
- [ ] **Phase 5 : Platform Requirements** — Spécifications techniques

---

**Status :** Product Brief Complete
**Next Phase :** Trigger Mapping
**Last Updated :** 2026-04-07
