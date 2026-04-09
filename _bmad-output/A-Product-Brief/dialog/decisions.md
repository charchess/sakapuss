# Key Decisions Log

**Project:** Sakapuss
**Last Updated:** 2026-04-07

---

## Decision 1 — Business Model

**Date:** 2026-04-07

**Opening question:** "Qui paie quoi ? Abonnement propriétaires, accès vétérinaires, les deux ?"

**User response (évolution de la discussion):**
- "aucune idée pour le moment... peut-être un abonnement pour un module d'analyse AI ? Gratuit pour les vétérinaires"
- "self-hosted assumé, mais sync local/cloud payante ?"
- "analyse statistique des triplets poids/caisse/nutrition + humeur/marques..."
- "crowd-sourcing des infos de santé — détection de risque sanitaire géographique, épidémie de gastro dans le nord-ouest..."

**Final Decision:**
Modèle freemium B2C avec plusieurs couches de monétisation :
1. **Base gratuite** — tracking, rappels, carnet de santé (cloud)
2. **Premium analytics** — abonnement, corrélations multi-facteurs (poids/litière/nutrition/humeur/marques)
3. **Sync cloud pour self-hosters** — payante, débloque analytics + connectivité vétérinaire
4. **Vétérinaires** — accès gratuit (levier d'acquisition et légitimité)
5. **Crowd-sourcing veille sanitaire** — différenciateur unique, potentiel B2B données agrégées anonymisées à terme

**Rationale:**
Le modèle dual (cloud gratuit/premium + self-hosted open source avec sync payante) permet de ne pas forcer la main aux utilisateurs tech tout en créant un chemin de monétisation naturel. Les vétérinaires gratuits créent de l'acquisition organique. Le crowd-sourcing transforme la masse d'utilisateurs en asset unique — veille sanitaire qui n'existe pas ailleurs.

**Implications produit:**
- Architecture multi-tenant cloud dès le départ
- Anonymisation et agrégation des données = feature critique
- Sync bidirectionnelle local/cloud à concevoir
- Module analytics séparable (feature flag)
- Dashboard vétérinaire = produit distinct du dashboard propriétaire

**Model type:** B2C Freemium + potentiel B2B données agrégées

---

## Decision 2 — Profil Client B2B (Vétérinaires)

**Date:** 2026-04-07

**Structure:** Relation n:1:m — plusieurs animaux liés à un cabinet, plusieurs praticiens dans le cabinet.

**Portail cabinet:** Compte manager + comptes associés (accès individuels par praticien). Consultation des dossiers "patients" via portail dédié.

**Stratégie d'acquisition:** Flywheel bidirectionnel — propriétaires font la pub aux cabinets (via leur usage quotidien), cabinets font la pub aux propriétaires (recommandation). Prospection initiale sur quelques cabinets pilotes, puis bouche à oreille.

**Adoption trigger:** Principalement inbound — un propriétaire parle de Sakapuss à son vétérinaire → vétérinaire s'inscrit gratuitement → recommande à ses autres clients → nouveaux propriétaires.

**Note:** "sur le papier" — stratégie à affiner, pas encore validée terrain.

---

## Decision 3 — Critères de Succès

**Date:** 2026-04-07

**Primaire (usage personnel) :**
Sakapuss devient la source de vérité — vision historique fiable, rappels fonctionnels, plus besoin du post-it frigo. Critère qualitatif : l'utilisateur cesse de chercher l'information ailleurs.

**Secondaire (lancement public) :**
- Rétention comportementale : saisies régulières sur 4 semaines consécutives = utilisateur actif
- Signal d'engagement fort : présence de rappels configurés (au-delà du simple essai, l'utilisateur fait confiance à Sakapuss pour quelque chose qui compte)

**Priorité :** Usage personnel d'abord, puis rétention publique.

**Rationale :** Sakapuss doit d'abord fonctionner pour le créateur (validation réelle par l'usage quotidien) avant de viser la croissance. La rétention comportementale est plus fiable que le nombre d'inscriptions pour mesurer la valeur perçue.

---

## Decision 4 — Paysage Concurrentiel & Avantage

**Date:** 2026-04-07

**Alternatives actuelles :**
- Notes téléphone / post-it frigo / carnet papier — bonne intention, mauvaise friction
- Excel (cas réel : suivi poids depuis naissance, mais nécessite d'aller à l'ordinateur)
- Do-nothing — le plus fréquent, parce que le besoin n'est pas conscient avant d'avoir la donnée
- Tractive — GPS, pas orienté santé quotidienne

**Pourquoi ils restent avec ces alternatives :**
Pas par choix rationnel — par inertie et manque de conscience du besoin. Une fois qu'on sait que ses chats perdent 30% de poids chaque printemps, on ne peut plus ne pas suivre.

**Avantage non copiable :**
Sakapuss est **log-first par design**, pas par ajout. Un concurrent (Tractive, portail vétérinaire) qui ajouterait le suivi alimentaire aurait le mauvais point d'entrée, la mauvaise UX, le mauvais mental model. La capture "as-you-go" sans friction est l'essence du produit, pas une feature.

**Signal de valeur clé :**
La donnée historique transforme l'anxiété en sérénité. Exemple : perte de 30% de poids au printemps — sans historique = panique. Avec historique = pattern connu, zéro inquiétude.

**Marché :** Peu existant sur la centralisation foyer + vétérinaire. Opportunité de première position.

---

## Decision 5 — Contraintes & Paramètres de Design

**Date:** 2026-04-07

**Fixe :**
- Budget externe : 0€
- Équipe : solo
- Pas de deadline externe

**Flexible :**
- Timeline (quality-driven, pas date-driven)
- Stack technique (non définitivement arrêtée)

**Atout :**
- Homelab Kubernetes disponible = déploiement production réel sans coût cloud, itération rapide

**Implications design :**
- Prioriser la robustesse et la maintenabilité (seul développeur)
- Pas de services tiers payants (ou freemium suffisant)
- Architecture cloud-ready dès le départ (pour le passage au cloud commercial)

---

## Decision 6 — Stratégie Plateforme

**Date:** 2026-04-07

**Plateforme :** Responsive web app (PWA possible à court terme). App native envisageable plus tard (introduit complexité sync).

**Device priority :** Mobile-first — capture quotidienne sur téléphone. Desktop = couche consultation secondaire.

**Offline :** Connected-first. Offline = nice-to-have pour v2.

**Implications design :**
- UI conçue pour le pouce, pas la souris
- Taille des touch targets ≥ 44px
- Chargement rapide sur mobile (réseau variable)
- PWA : notifications push possibles sans app store

---

## Decision 7 — Ton de Voix

**Date:** 2026-04-07

**Attributs :**
1. **Chaleureux & bienveillant** — Attachement aux animaux, sans être mièvre
2. **Direct & efficace** — Labels courts, actions claires, saisie réflexe
3. **Rassurant** — Les alertes informent calmement, ne paniquent pas
4. **Sobre** — Pas d'exclamations ou d'emojis excessifs

**Cycle de vie des rappels (comportement clé) :**
- À venir : "Vermifuge de Pixel dans 7 jours — pensez à prendre rendez-vous"
- Imminent : "Vermifuge de Pixel demain — tout est prêt ?"
- En retard : "Vermifuge de Pixel — en attente de validation"
- Validé : "Vermifuge de Pixel ✓ — prochain dans 6 mois"

**Règle fondamentale :** Un rappel non validé reste visible jusqu'à confirmation explicite. Il ne disparaît pas silencieusement.

**Rappels = proactifs par design** — ils arrivent avant la date pour permettre d'anticiper (RDV, achat médicaments), et persistent après si non validés.
