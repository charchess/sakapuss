# Design Log: Sakapuss

> Project memory — decisions, progress, and artifacts

**Project:** Sakapuss
**Started:** 2026-04-07
**Last Updated:** 2026-04-08

---

## Progress

### 2026-04-07 - Phase 1: Product Brief Complete

**Agent:** Saga (Product Brief)
**Brief Level:** Complete

**Artifacts Created:**
- `A-Product-Brief/project-brief.md`
- `A-Product-Brief/content-language.md`
- `A-Product-Brief/visual-direction.md`
- `A-Product-Brief/platform-requirements.md`
- `A-Product-Brief/dialog/00-context.md`
- `A-Product-Brief/dialog/02-vision.md`
- `A-Product-Brief/dialog/03-users.md`
- `A-Product-Brief/dialog/04-concept.md`
- `A-Product-Brief/dialog/07-positioning.md`
- `A-Product-Brief/dialog/decisions.md`
- `A-Product-Brief/dialog/progress-tracker.md`

**Summary:** Hub de santé animale self-hosted avec vocation cloud public. Concept structurant = log-first (l'entrée c'est l'action, pas l'animal). Modèle freemium B2C avec portail vétérinaire gratuit et potentiel B2B données agrégées via crowd-sourcing de veille sanitaire. Stack FastAPI + SvelteKit + SQLite (v1) → PostgreSQL + MinIO (v2 cloud). Personnalité visuelle = animal facecam qui parle en première personne, palette colorée expressive.

**Next:** Phase 2 — Trigger Mapping

---

### 2026-04-07 - Phase 2: Trigger Mapping Complete

**Agent:** Saga (Trigger Mapping — Dream Mode)
**Mode:** Dream (génération autonome, revue utilisateur)
**Methodology:** Effect Mapping (Balic & Domingues), adapted with negative driving forces

**Artifacts Created:**
- `B-Trigger-Map/00-trigger-map.md` (hub + diagramme Mermaid)
- `B-Trigger-Map/01-Business-Goals.md`
- `B-Trigger-Map/personas/02-Camille-la-Gardienne.md`
- `B-Trigger-Map/personas/03-Thomas-le-Contributeur.md`
- `B-Trigger-Map/personas/04-Dr-Martin-le-Praticien.md`
- `B-Trigger-Map/05-Key-Insights.md`

**Strategic Output:**

**THE ENGINE (BG0):** 100 Propriétaires Actifs en 6 mois — métrique = 4 semaines de saisies régulières + au moins 1 rappel configuré. Sans eux, pas de flywheel, pas de données, pas de monétisation.

**Flywheel:** Camille utilise quotidiennement → recommande à Dr. Martin → Dr. Martin accède gratuitement → recommande à ses clients → nouveaux Camille.

**Personas:** Camille la Gardienne (PRIMARY, moteur), Thomas le Contributeur (SECONDARY, enrichit les données), Dr. Martin le Praticien (TERTIARY, amplificateur flywheel).

**Le moment de vérité :** Premier rappel validé — Camille voit "Vermifuge de Pixel ✓ — prochain dans 6 mois" → rétention long terme acquise.

**Feature Priority Confirmed:**
1. Log-first mobile (< 3 sec)
2. Rappels cycle complet (avant → validé → prochain)
3. Timeline historique + graphiques
4. Portail vétérinaire lecture-seule
5. Onboarding Thomas (< 2 min)
6. Analytics corrélations (v2)

**Next:** Phase 3 — UX Scenarios

---

### 2026-04-08 — Phase 3: UX Scenarios Complete

**Agent:** Saga (Scenario Outline)
**Scenarios:** 9 scénarios couvrant 22 pages
**Quality:** Excellent (9/9 scénarios — scores max sur les 4 dimensions)

**Artifacts Created:**
- `C-UX-Scenarios/00-ux-scenarios.md` — Index scénarios + coverage matrix
- `C-UX-Scenarios/01-camille-s-installe/01-camille-s-installe.md` — Camille s'installe
- `C-UX-Scenarios/01-camille-s-installe/01.1-inscription/01.1-inscription.md` — Step: Inscription
- `C-UX-Scenarios/02-camille-note-une-action/02-camille-note-une-action.md` — Camille note sa première action
- `C-UX-Scenarios/02-camille-note-une-action/02.1-dashboard/02.1-dashboard.md` — Step: Dashboard
- `C-UX-Scenarios/03-camille-valide-un-rappel/03-camille-valide-un-rappel.md` — Camille valide un rappel
- `C-UX-Scenarios/03-camille-valide-un-rappel/03.1-liste-des-rappels/03.1-liste-des-rappels.md` — Step: Liste des rappels
- `C-UX-Scenarios/04-camille-consulte-l-historique/04-camille-consulte-l-historique.md` — Camille consulte l'historique
- `C-UX-Scenarios/04-camille-consulte-l-historique/04.1-timeline-historique/04.1-timeline-historique.md` — Step: Timeline
- `C-UX-Scenarios/05-camille-invite-thomas/05-camille-invite-thomas.md` — Camille invite Thomas
- `C-UX-Scenarios/05-camille-invite-thomas/05.1-gestion-du-foyer/05.1-gestion-du-foyer.md` — Step: Gestion du foyer
- `C-UX-Scenarios/06-thomas-note-une-observation/06-thomas-note-une-observation.md` — Thomas note une observation
- `C-UX-Scenarios/06-thomas-note-une-observation/06.1-onboarding-thomas/06.1-onboarding-thomas.md` — Step: Onboarding Thomas
- `C-UX-Scenarios/07-camille-partage-avec-le-vet/07-camille-partage-avec-le-vet.md` — Camille partage avec son vétérinaire
- `C-UX-Scenarios/07-camille-partage-avec-le-vet/07.1-partage-veterinaire/07.1-partage-veterinaire.md` — Step: Partage vétérinaire
- `C-UX-Scenarios/08-dr-martin-consulte-un-dossier/08-dr-martin-consulte-un-dossier.md` — Dr. Martin consulte un dossier patient
- `C-UX-Scenarios/08-dr-martin-consulte-un-dossier/08.1-dashboard-cabinet/08.1-dashboard-cabinet.md` — Step: Dashboard cabinet
- `C-UX-Scenarios/09-camille-passe-au-premium/09-camille-passe-au-premium.md` — Camille passe au premium
- `C-UX-Scenarios/09-camille-passe-au-premium/09.1-analytics-correlations/09.1-analytics-correlations.md` — Step: Analytics

**Summary:** 9 scénarios UX couvrant les 3 personas (Camille 6, Thomas 1, Dr. Martin 1, mixte 1) et les 22 pages de l'inventaire. Décisions design clés émergées : friction proportionnelle à la fréquence d'action, Quick Log avec auto-enregistrement 3 sec (Option C), rappels J-7 actionnables + Done/Postpone, catégories système A1 (8 catégories), portail vet avec signal médical filtré et alertes proactives, accès vet sans compte via lien révocable, freemium Logique A (quota mensuel). Idée stratégique capturée : notifications vétérinaire pré-RDV. Ressources foyer (caisses, gamelles) nommées librement par l'admin.

**Next:** Phase 4 — UX Design

---

### 2026-04-08 — Phase 4: UX Design Complete (Dream Mode)

**Agent:** Freya (UX Design — Dream Mode)
**Mode:** Dream (autonomous generation, user review pending)
**Pages Designed:** 20 pages across 8 scenarios

**Artifacts Created:**

**Design System:**
- `D-Design-System/00-design-system.md` — Color palette, spacing scale, type scale, elevation, shared components (Quick Action Tile, Reminder Card, Animal Avatar, Category Badge, Confirmation Toast, Bottom Navigation)

**Scenario 01 — Camille s'installe (5 pages):**
- `C-UX-Scenarios/01-camille-s-installe/01.1-inscription/01.1-inscription.md` — Account creation (email + social auth)
- `C-UX-Scenarios/01-camille-s-installe/01.2-ajout-animal/01.2-ajout-animal.md` — Animal definition (name + species mandatory)
- `C-UX-Scenarios/01-camille-s-installe/01.3-onboarding-admin/01.3-onboarding-admin.md` — Optional config wizards (santé, poids, alimentation)
- `C-UX-Scenarios/01-camille-s-installe/01.4-login/01.4-login.md` — Returning user auth (storyboard)
- `C-UX-Scenarios/01-camille-s-installe/01.5-parametres/01.5-parametres.md` — Account settings (storyboard)

**Scenario 02 — Camille note une action (3 pages):**
- `C-UX-Scenarios/02-camille-note-une-action/02.1-dashboard/02.1-dashboard.md` — Quick action grid, log-first entry point
- `C-UX-Scenarios/02-camille-note-une-action/02.2-quick-log-selection/02.2-quick-log-selection.md` — Animal/resource selection bottom sheet
- `C-UX-Scenarios/02-camille-note-une-action/02.3-quick-log-confirmation/02.3-quick-log-confirmation.md` — Auto-save confirmation toast (Option C, 3 sec)

**Scenario 03 — Camille valide un rappel (2 pages):**
- `C-UX-Scenarios/03-camille-valide-un-rappel/03.1-liste-des-rappels/03.1-liste-des-rappels.md` — Reminders by status (today/upcoming/overdue)
- `C-UX-Scenarios/03-camille-valide-un-rappel/03.2-rappel-detail/03.2-rappel-detail.md` — Done/Postpone + cycle closure (moment de vérité)

**Scenario 04 — Camille consulte l'historique (3 pages):**
- `C-UX-Scenarios/04-camille-consulte-l-historique/04.1-timeline-historique/04.1-timeline-historique.md` — Chronological feed with category filters
- `C-UX-Scenarios/04-camille-consulte-l-historique/04.2-graphique-poids/04.2-graphique-poids.md` — Weight chart with trend indication
- `C-UX-Scenarios/04-camille-consulte-l-historique/04.3-profil-animal/04.3-profil-animal.md` — Complete animal card + share with vet CTA

**Scenario 05 — Camille invite Thomas (1 page):**
- `C-UX-Scenarios/05-camille-invite-thomas/05.1-gestion-du-foyer/05.1-gestion-du-foyer.md` — Member management + invite with access profiles

**Scenario 06 — Thomas note une observation (2 pages):**
- `C-UX-Scenarios/06-thomas-note-une-observation/06.1-onboarding-thomas/06.1-onboarding-thomas.md` — Zero-friction invitation acceptance
- `C-UX-Scenarios/06-thomas-note-une-observation/06.2-dashboard-thomas/06.2-dashboard-thomas.md` — Reduced Saisie-profile dashboard

**Scenario 07 — Camille partage avec le vet (2 pages):**
- `C-UX-Scenarios/07-camille-partage-avec-le-vet/07.1-partage-veterinaire/07.1-partage-veterinaire.md` — Permanent revocable link generation
- `C-UX-Scenarios/07-camille-partage-avec-le-vet/07.2-login-vet/07.2-login-vet.md` — Zero-friction dossier access + optional portal

**Scenario 08 — Dr. Martin consulte un dossier (2 pages):**
- `C-UX-Scenarios/08-dr-martin-consulte-un-dossier/08.1-dashboard-cabinet/08.1-dashboard-cabinet.md` — Patient search + recent dossiers (desktop)
- `C-UX-Scenarios/08-dr-martin-consulte-un-dossier/08.2-dossier-patient/08.2-dossier-patient.md` — Full medical context in 30 sec (desktop)

**Design Decisions Made:**
- Design System: Nunito (display) + Inter (body), flat expressive color palette with category colors
- Dashboard: 2-column quick action grid, log-first — action is the entry point, not the animal
- Quick Log: Bottom sheet for selection, toast with 3-sec auto-save (Option C) for confirmation
- Reminders: Segmented list (today/upcoming/overdue), Done/Postpone with auto-planned next cycle
- Vet portal: Desktop-first, two-column layout, alerts-first (proactive medical signals)
- Vet access: Zero friction — dossier visible via link without account, portal optional upgrade
- Thomas: Reduced dashboard matching Saisie profile, household resources visible
- Bottom nav: 5 items (Home, Timeline, +, Reminders, Profile) with prominent center "+" shortcut

**Shared Components Extracted:**
Quick Action Tile, Reminder Card, Animal Avatar, Category Badge, Confirmation Toast, Bottom Navigation

**Next:** User review of all specs → adjustments → Phase 5 (Agentic Development)

---

## Design Loop Status

| Scenario | Page | Name | Status | Date |
|----------|------|------|--------|------|
| 01 | 01.1 | Inscription | specified | 2026-04-08 |
| 01 | 01.2 | Ajout animal | specified | 2026-04-08 |
| 01 | 01.3 | Onboarding Admin | specified | 2026-04-08 |
| 01 | 01.4 | Login | specified | 2026-04-08 |
| 01 | 01.5 | Paramètres | specified | 2026-04-08 |
| 02 | 02.1 | Home / Dashboard | specified | 2026-04-08 |
| 02 | 02.2 | Quick Log — Sélection | specified | 2026-04-08 |
| 02 | 02.3 | Quick Log — Confirmation | specified | 2026-04-08 |
| 03 | 03.1 | Liste des rappels | specified | 2026-04-08 |
| 03 | 03.2 | Rappel détail + validation | specified | 2026-04-08 |
| 04 | 04.1 | Timeline / Historique | specified | 2026-04-08 |
| 04 | 04.2 | Graphique de poids | specified | 2026-04-08 |
| 04 | 04.3 | Profil animal | specified | 2026-04-08 |
| 05 | 05.1 | Gestion du foyer | specified | 2026-04-08 |
| 06 | 06.1 | Onboarding Thomas | specified | 2026-04-08 |
| 06 | 06.2 | Dashboard Thomas | specified | 2026-04-08 |
| 07 | 07.1 | Partage vétérinaire | specified | 2026-04-08 |
| 07 | 07.2 | Login/Inscription vétérinaire | specified | 2026-04-08 |
| 08 | 08.1 | Dashboard cabinet | specified | 2026-04-08 |
| 08 | 08.2 | Dossier patient | specified | 2026-04-08 |

---

## Key Decisions

| Date | Decision | Phase | Participants |
|------|----------|-------|--------------|
| 2026-04-07 | Projet personnel avec vocation publique — pas self-hosted uniquement | Phase 1: Product Brief | Saga + Charchess |
| 2026-04-07 | Concept log-first — entrée = action/observation, pas l'animal | Phase 1: Product Brief | Saga + Charchess |
| 2026-04-07 | Modèle freemium B2C + sync cloud payante pour self-hosters + vétérinaires gratuits | Phase 1: Product Brief | Saga + Charchess |
| 2026-04-07 | Crowd-sourcing veille sanitaire animale anonymisée — différenciateur unique | Phase 1: Product Brief | Saga + Charchess |
| 2026-04-07 | Personnalité = l'animal lui-même (facecam + voix première personne + variantes phrases) | Phase 1: Product Brief | Saga + Charchess |
| 2026-04-07 | Style visuel A (flat expressif coloré) → évolution vers B (illustré) ultérieurement | Phase 1: Product Brief | Saga + Charchess |
| 2026-04-07 | HA : intégration native (custom component) + MQTT en option | Phase 1: Product Brief | Saga + Charchess |
| 2026-04-07 | Stack v2 : CloudNativePG (PostgreSQL) + MinIO déjà disponibles dans homelab k8s | Phase 1: Product Brief | Saga + Charchess |
| 2026-04-07 | Rappels = cycle complet (avant + pendant + après) — validation obligatoire, jamais silencieux | Phase 1: Product Brief | Saga + Charchess |
| 2026-04-07 | THE ENGINE = Propriétaires Actifs (BG0) — priorité absolue sur réseau vétérinaires et veille sanitaire | Phase 2: Trigger Map | Saga (Dream) |
| 2026-04-07 | Flywheel validé : Camille → Dr. Martin (gratuit) → recommande clients → nouveaux Camille | Phase 2: Trigger Map | Saga (Dream) |
| 2026-04-07 | Portail vétérinaire = lecture-seule épuré, < 30 sec pour trouver l'info — pas une app complète | Phase 2: Trigger Map | Saga (Dream) |
| 2026-04-08 | Friction proportionnelle à la fréquence : gamelle = 2 taps, pesée = 3 taps + valeur, événement libre = formulaire court acceptable | Phase 3: UX Scenarios | Saga + Charchess |
| 2026-04-08 | Quick Log confirmation : options discrètes (note/poids) avec auto-enregistrement après ~3 sec si ignorées (Option C) | Phase 3: UX Scenarios | Saga + Charchess |
| 2026-04-08 | Rappels : notification J-7 actionnable (commander produit / prendre RDV) + Jour J avec Done ou Postpone (délais standardisés) | Phase 3: UX Scenarios | Saga + Charchess |
| 2026-04-08 | Idée stratégique : notifications vétérinaire pré-RDV ("tenez le Feligen prêt") — levier d'adoption cabinet, à évaluer Phase 1 ou 2 | Phase 3: UX Scenarios | Saga + Charchess |
| 2026-04-08 | Catégories système A1 : Santé / Poids / Alimentation / Litière / Comportement / Événement libre / Rappels / Activité — extensibles selon besoins | Phase 3: UX Scenarios | Saga + Charchess |
| 2026-04-08 | Portail vet : Activité masquée par défaut, filtre "tout afficher" disponible — signal médical propre sans bruit routinier | Phase 3: UX Scenarios | Saga + Charchess |
| 2026-04-08 | Portail vet : alertes statistiques + retards de traitement en haut du dossier — Dr. Martin voit les signaux avant même de parler | Phase 3: UX Scenarios | Saga + Charchess |
| 2026-04-08 | Accès vet via lien permanent révocable — pas de compte requis pour consulter, portail optionnel pour centraliser tous les patients | Phase 3: UX Scenarios | Saga + Charchess |
| 2026-04-08 | Freemium Logique A : quota mensuel d'insights (ex: 2/mois) — assez pour créer la valeur, assez limité pour motiver la conversion | Phase 3: UX Scenarios | Saga + Charchess |
| 2026-04-08 | Base gratuite genuinement utile : log, rappels, timeline, partage vet, multi-users — premium amplifie, n'est pas un déblocage de fonctions essentielles | Phase 3: UX Scenarios | Saga + Charchess |
| 2026-04-08 | Scénario 09 (premium) = Phase 2 — non prioritaire au lancement, documenté pour cadrer la vision | Phase 3: UX Scenarios | Saga + Charchess |
| 2026-04-08 | Caisses = ressources foyer nommées librement par l'admin (Caisse cuisine, Caisse rouge...), pas liées à un animal | Phase 3: UX Scenarios | Saga + Charchess |
| 2026-04-08 | Profils d'accès membres : Total / Saisie / Consultation — choisis à l'invitation, profil fait le travail | Phase 3: UX Scenarios | Saga + Charchess |
| 2026-04-08 | Onboarding : parcours de config optionnels (rappels santé, poids, alimentation) — skippables et rappelables plus tard | Phase 3: UX Scenarios | Saga + Charchess |
| 2026-04-08 | Design System : Nunito (display) + Inter (body), flat expressif coloré avec couleurs par catégorie | Phase 4: UX Design | Freya (Dream) |
| 2026-04-08 | Bottom Nav 5 items : Home, Timeline, + (center shortcut), Reminders, Profile | Phase 4: UX Design | Freya (Dream) |
| 2026-04-08 | Quick Log flow : Dashboard grid → Bottom sheet sélection → Toast auto-save 3 sec (Option C confirmé) | Phase 4: UX Design | Freya (Dream) |
| 2026-04-08 | Dashboard Thomas : grille réduite 2×2 au profil Saisie, sans gestion rappels | Phase 4: UX Design | Freya (Dream) |
| 2026-04-08 | Portail vet desktop : layout deux colonnes (35%/65%), alertes proactives en haut, timeline filtrée médicale par défaut | Phase 4: UX Design | Freya (Dream) |
| 2026-04-08 | Accès vet landing : dossier visible immédiatement sans compte, banner non-bloquant pour création portail | Phase 4: UX Design | Freya (Dream) |
