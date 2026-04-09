# User Definition Dialog

**Step:** 07 — Target Users
**Completed:** 2026-04-07
**Status:** confirmed

---

## Opening

**Question:** "Qui est l'utilisateur principal de Sakapuss dans la vraie vie ? Son quotidien, ses stress, comment il gère ça aujourd'hui ?"

**User response:** "commande un sac de graine, le note. nettoie une caisse, le note. remplis une gamelle, le note. voit un comportement inhabituel, le note. pèse le chat, le note. Reçoit des notifications de fin de sac, de rappels vétérinaires, valide l'action (antipuce), reçoit alerte pesée, notification stock faible..."

**Signal:** Usage dual — saisie proactive (routine) + réception passive (alertes). L'utilisateur est à la fois acteur et destinataire.

---

## Key Exchanges

**Q:** Frustration aujourd'hui sans Sakapuss ?

**A:** "note sur le frigo pour les rendez-vous, mémoire pour les vermifuges, déjà oublié..."

**Signal:** Système actuel = fragile, dispersé, coupabilisant. La valeur de Sakapuss = centralisation + proactivité.

---

**Q:** Utilisateur secondaire (membre du foyer) ?

**A:** "prise de notes aussi (caisse, nourriture, comportement, poids) mais peut-être optionnel selon le profil ? configurable ? profil maître qui donne les droits ou profil self-configurable ? accès aux données de la même manière (peut-être contrôlé par maître/admin ?)"

**Signal:** Besoin de gestion de rôles et permissions au niveau du foyer. Flexibilité : admin-controlled ou self-service.

---

**A (ajout):** "important : il faut aussi pouvoir noter des événements détaillés et datés genre 'a fait une chute...' ou autre remarques"

**Signal:** Journal d'événements libres = feature distincte du suivi routinier. Couche narrative critique pour les consultations vétérinaires.

---

## Reflection Checkpoint

**Synthesis présentée:** 3 profils (propriétaire attentif + membre foyer + vétérinaire) + journal événements libre

**User response:** "oui" ✅ Confirmed first try.

---

## User Profiles

### Primaire — Le Propriétaire Attentif
- **Qui :** Propriétaire d'animaux impliqué, tech-comfortable (pas forcément tech-savvy)
- **Quotidien :** Note la routine (nourriture, litière, poids), documente les événements libres, reçoit et agit sur les alertes
- **Frustration actuelle :** Post-it frigo, mémoire, oublis coupabilisants (vermifuges, dates rappels)
- **Objectif :** Paix d'esprit, ne plus rien oublier, avoir un historique fiable pour le vétérinaire
- **Rôle dans l'app :** Admin du compte foyer, configure les droits des autres membres

### Secondaire — Le Membre du Foyer
- **Qui :** Autre personne du foyer (parent, conjoint, aide à domicile)
- **Quotidien :** Saisit les actions routinières (caisse, gamelle, observation ponctuelle)
- **Particularité :** Accès et droits configurables (par admin ou self-service selon config)
- **Besoin UX critique :** Saisie ultra-rapide, zéro friction — sinon abandon

### Tertiaire — Le Vétérinaire
- **Qui :** Praticien en cabinet (individuel ou en équipe)
- **Quotidien :** Consulte l'historique patient avant/pendant la consultation
- **Ne fait pas :** Ne saisit pas de données
- **Valeur :** Accès à l'historique complet (poids, alimentation, comportements, événements libres, rappels validés)
- **Accès :** Via portail cabinet, gratuit

---

## Feature Implication

**Journal d'événements libres** (daté, texte libre) = feature distincte et critique :
- Distincte du suivi routinier (métriques)
- Consultable par le vétérinaire
- Peut contenir des observations ponctuelles importantes ("chute", "vomissement", "refus gamelle")
