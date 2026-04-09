# UX Scenarios: Sakapuss

> Scenario outlines connecting Trigger Map personas to concrete user journeys

**Created:** 2026-04-08
**Author:** Charchess with Saga (WDS)
**Method:** Whiteport Design Studio (WDS)

---

## Scenario Summary

| ID | Scenario | Persona | Pages | Priorité | Statut |
|----|----------|---------|-------|----------|--------|
| 01 | Camille s'installe | Camille (Primary) | 5 | ⭐ P1 | ✅ Outlined |
| 02 | Camille note sa première action | Camille (Primary) | 3 | ⭐ P1 | ✅ Outlined |
| 03 | Camille valide un rappel | Camille (Primary) | 2 | ⭐ P1 | ✅ Outlined |
| 04 | Camille consulte l'historique | Camille (Primary) | 3 | P2 | ✅ Outlined |
| 05 | Camille invite Thomas | Camille (Primary) | 1 | P2 | ✅ Outlined |
| 06 | Thomas note une observation | Thomas (Secondary) | 2 | P2 | ✅ Outlined |
| 07 | Camille partage avec son vétérinaire | Camille + Dr. Martin | 2 | P2 | ✅ Outlined |
| 08 | Dr. Martin consulte un dossier patient | Dr. Martin (Tertiary) | 2 | P2 | ✅ Outlined |
| 09 | Camille passe au premium | Camille (Primary) | 2 | P3 ⚠️ Phase 2 | ✅ Outlined |

---

## Scénarios

### [01 : Camille s'installe](01-camille-s-installe/01-camille-s-installe.md)
**Persona :** Camille la Gardienne — FEAR "App trop complexe → abandon"
**Pages :** Login · Inscription · Onboarding Admin · Ajout animal · Paramètres
**Valeur utilisateur :** Compte créé, animaux dans le système, premiers rappels santé planifiés
**Valeur business :** Utilisateur activé avec métriques BG0 amorcées dès le premier soir

---

### [02 : Camille note sa première action](02-camille-note-une-action/02-camille-note-une-action.md)
**Persona :** Camille la Gardienne — WANT "Saisie en 3 secondes — réflexe quotidien"
**Pages :** Home/Dashboard · Quick Log sélection · Quick Log confirmation
**Valeur utilisateur :** Action enregistrée en moins de 3 secondes, feedback immédiat
**Valeur business :** Core loop validé, métrique saisies régulières BG0 commence à tourner

---

### [03 : Camille valide un rappel](03-camille-valide-un-rappel/03-camille-valide-un-rappel.md)
**Persona :** Camille la Gardienne — WANT "Ne plus jamais oublier un soin"
**Pages :** Liste des rappels · Rappel détail + validation
**Valeur utilisateur :** Cycle complet vécu (avant → validé → prochain) — moment de vérité
**Valeur business :** Rétention long terme activée — Camille comprend la promesse fondamentale

---

### [04 : Camille consulte l'historique](04-camille-consulte-l-historique/04-camille-consulte-l-historique.md)
**Persona :** Camille la Gardienne — WANT "Comprendre les patterns sans anxiété"
**Pages :** Timeline/Historique · Graphique de poids · Profil animal
**Valeur utilisateur :** Tendance récente visible, anxiété → sérénité, option partage vétérinaire
**Valeur business :** Valeur historique perçue avant 4 semaines — rétention confirmée

---

### [05 : Camille invite Thomas](05-camille-invite-thomas/05-camille-invite-thomas.md)
**Persona :** Camille la Gardienne — WANT "Dossier enrichi par tout le foyer"
**Pages :** Gestion du foyer
**Valeur utilisateur :** Thomas intégré en 2 minutes avec profil adapté (Total / Saisie / Consultation)
**Valeur business :** Architecture multi-utilisateurs validée, données foyer enrichies

---

### [06 : Thomas note une observation](06-thomas-note-une-observation/06-thomas-note-une-observation.md)
**Persona :** Thomas le Contributeur — WANT "Contribuer sans apprendre une complexité"
**Pages :** Onboarding Thomas · Dashboard Thomas
**Valeur utilisateur :** Première saisie en moins de 30 secondes, sans aide
**Valeur business :** Modèle contributeur validé, données foyer enrichies

---

### [07 : Camille partage avec son vétérinaire](07-camille-partage-avec-le-vet/07-camille-partage-avec-le-vet.md)
**Persona :** Camille (Primary) + Dr. Martin (Tertiary) — WANT "Dossier complet pour le vétérinaire"
**Pages :** Partage vétérinaire · Login/Inscription vétérinaire
**Valeur utilisateur :** Lien envoyé en 2 taps, Dr. Martin accède sans friction, portail créé en 1 clic
**Valeur business :** Premier vétérinaire onboardé — flywheel activé

---

### [08 : Dr. Martin consulte un dossier patient](08-dr-martin-consulte-un-dossier/08-dr-martin-consulte-un-dossier.md)
**Persona :** Dr. Martin le Praticien — WANT "Historique réel en 30 secondes"
**Pages :** Dashboard cabinet · Dossier patient
**Valeur utilisateur :** Contexte complet (alertes, retards, poids, timeline filtrée) en 30 secondes
**Valeur business :** Dr. Martin voit la valeur → recommande à ses clients → flywheel tourne

---

### [09 : Camille passe au premium](09-camille-passe-au-premium/09-camille-passe-au-premium.md)
**Persona :** Camille la Gardienne — WANT "Insights proactifs / corrélations multi-facteurs"
**Pages :** Analytics/Corrélations · Upgrade/Abonnement
**Valeur utilisateur :** Accès aux corrélations illimitées, valeur justifiée dès la première minute
**Valeur business :** Première conversion premium — revenu récurrent BG1
> ⚠️ Phase 2 — non prioritaire au lancement

---

## Page Coverage Matrix

| Page | Scénario | Rôle dans le flow |
|------|----------|-------------------|
| Login | 01 | Retour utilisateur existant (storyboard item) |
| Inscription | 01 | Création de compte — point d'entrée |
| Onboarding Admin | 01 | Parcours de configuration guidé (rappels santé, poids, alimentation) |
| Ajout animal | 01 | Définition des animaux (nom + espèce obligatoire, détails optionnels) |
| Paramètres / Compte | 01 | Préférences compte (storyboard item accessible depuis onboarding) |
| Home / Dashboard | 02 | Grille d'actions rapides — point d'entrée log-first |
| Quick Log — sélection | 02 | Sélection action + ressource (animal ou ressource foyer) |
| Quick Log — confirmation | 02 | Feedback immédiat + options discrètes (note / poids) |
| Liste des rappels | 03 | Vue consolidée rappels par statut (aujourd'hui / à venir / en retard) |
| Rappel détail + validation | 03 | Cycle complet : Done ou Postpone, prochain rappel planifié |
| Timeline / Historique | 04 | Fil chronologique filtrable par catégorie |
| Graphique de poids | 04 | Courbe de poids, tendances récentes, patterns long terme |
| Profil animal | 04 | Fiche complète + option partage vétérinaire |
| Gestion du foyer | 05 | Invitation membres + choix profil (Total / Saisie / Consultation) |
| Onboarding Thomas | 06 | Acceptation invitation, compréhension du rôle en une phrase |
| Dashboard Thomas | 06 | Grille réduite au profil Saisie, ressources foyer |
| Partage vétérinaire | 07 | Génération lien permanent révocable, envoi par email |
| Login/Inscription vétérinaire | 07 | Accès dossier sans compte + création portail optionnelle |
| Dashboard cabinet | 08 | Recherche patient par nom, accès rapide aux dossiers récents |
| Dossier patient | 08 | Résumé médical : alertes, retards, poids, timeline filtrée |
| Analytics / Corrélations | 09 | Insights du mois, limite gratuite, teaser corrélation |
| Upgrade / Abonnement | 09 | Présentation premium, souscription, accès immédiat |

**Couverture : 22/22 pages assignées** ✅

---

## Décisions Design Clés

| Décision | Scénario | Impact |
|----------|----------|--------|
| Friction proportionnelle à la fréquence (2 taps → formulaire) | 02 | Core loop |
| Quick Log confirmation : options discrètes + auto-enregistrement 3 sec | 02 | Core loop |
| Rappels : J-7 actionnable + Jour J Done/Postpone | 03 | Rétention |
| Catégories système A1 (8 catégories, extensibles) | 08 | Data quality |
| Portail vet : Activité masquée par défaut, alertes statistiques en haut | 08 | Dr. Martin UX |
| Accès vet sans compte (lien suffit), portail optionnel | 07 | Flywheel friction |
| Ressources foyer (caisses, gamelles) nommées par Camille | 02/06 | Multi-users |
| Freemium Logique A : quota mensuel d'insights | 09 | Monétisation |
| Notifications vétérinaire pré-RDV — à évaluer Phase 1 ou 2 | 03/07 | Stratégique |

---

## Next Phase

Ces scenario outlines alimentent **Phase 4 : UX Design** — chaque page reçoit :
- Spécifications de page détaillées
- Wireframe sketches
- Définitions des composants
- Détails d'interaction

---

_Generated with Whiteport Design Studio framework_
