# 07 : Camille partage avec son vétérinaire

**Project:** Sakapuss
**Created:** 2026-04-08
**Method:** Whiteport Design Studio (WDS)
**Design Intent:** D (Dream Up)
**Design Status:** not-started

---

## Transaction (Q1)

**What this scenario covers:**
Camille génère un lien d'accès permanent pour son vétérinaire, Dr. Martin l'ouvre, consulte le dossier immédiatement sans compte, puis crée son portail cabinet pour centraliser tous ses patients Sakapuss.

---

## Business Goal (Q2)

**Goal:** BG1 — Réseau vétérinaires + Monétisation
**Objective:** Chaque vétérinaire onboardé est un amplificateur potentiel de 5 à 20 nouveaux Camille. La promesse "dossier partageable avec le vétérinaire" devient concrète.

---

## User & Situation (Q3)

**Persona:** Camille la Gardienne (Primary) + Dr. Martin le Praticien (Tertiary)
**Situation (Camille) :** A un RDV vétérinaire dans 3 jours. Veut que Dr. Martin arrive préparé — elle génère le lien à la maison et l'envoie en avance. *(Sunshine path — Déclencheur B)*

**Situation (Dr. Martin) :** Reçoit un email de Camille avec un lien vers le dossier de Pixel. L'ouvre depuis son cabinet, probablement sur desktop.

---

## Driving Forces (Q4)

**Hope (Camille) :** Dr. Martin ouvre le lien, voit le dossier de Pixel immédiatement — et crée son portail pour centraliser tous ses patients Sakapuss.

**Worry (Camille) :** Dr. Martin ne clique pas sur le lien, ou le trouve inutile et ne crée pas de portail — le flywheel ne se ferme pas.

---

## Access Model

> **Lien d'accès permanent révocable :** Dr. Martin n'a pas besoin de compte pour consulter le dossier — le lien suffit. La création de portail est optionnelle et apporte une valeur supérieure (centralisation de tous les patients).
>
> - **Sans compte :** Lien → dossier visible immédiatement
> - **Avec compte (nouveau) :** "Créer mon portail cabinet" → compte créé + Pixel lié automatiquement
> - **Avec compte (existant) :** "Ajouter à mon portail" → Pixel lié au cabinet existant
>
> Lien révocable par Camille depuis la gestion du foyer.

---

## Device & Starting Point (Q5 + Q6)

**Device (Camille) :** Mobile — dans l'app, depuis le profil animal ou la vue partage vétérinaire
**Device (Dr. Martin) :** Desktop probable — reçoit l'email au cabinet, ouvre dans le navigateur

**Entry (Camille) :** Dans l'app, avant un RDV planifié dans 3 jours. Navigue vers le profil de Pixel ou la vue "Partager avec mon vétérinaire".
**Entry (Dr. Martin) :** Email reçu "Camille vous partage le dossier de Pixel" → clic sur le lien → accès direct.

---

## Best Outcome (Q7)

**User Success (Camille) :** Le lien est envoyé en 2 taps — Dr. Martin a accès au dossier complet de Pixel sans rien avoir à installer.

**User Success (Dr. Martin) :** Il ouvre le lien, voit le dossier immédiatement, crée son portail cabinet en un clic — tous ses futurs patients Sakapuss seront centralisés automatiquement.

**Business Success :** Premier vétérinaire onboardé — flywheel activé. Sa recommandation à ses clients peut créer 5 à 20 nouveaux Camille.

---

## Shortest Path (Q8)

1. **Partage vétérinaire** — Camille ouvre le profil de Pixel (ou la vue dédiée), tape "Partager avec mon vétérinaire", entre l'email de Dr. Martin, envoie le lien.
2. **Login / Inscription vétérinaire** — Dr. Martin reçoit l'email, ouvre le lien → voit le dossier de Pixel immédiatement (sans compte). Il tape "Créer mon portail cabinet" → compte créé, Pixel lié automatiquement. ✓

*Storyboard items :*
- *Déclencheur A : pendant consultation (génère le lien sur place)*
- *Déclencheur C : depuis la timeline (scénario 04, bouton partage)*
- *"Ajouter à mon portail" si Dr. Martin a déjà un compte*
- *Consultation sans compte (valeur partielle, pas de flywheel)*
- *Lien révocable depuis la gestion du foyer*

---

## Trigger Map Connections

**Persona:** Camille la Gardienne (Primary) + Dr. Martin le Praticien (Tertiary)

**Driving Forces Addressed:**
- ✅ **Want (Camille) :** Avoir un dossier complet pour le vétérinaire
- ✅ **Want (Dr. Martin) :** Accéder à l'historique réel du patient
- ❌ **Fear (Dr. Martin) :** Interface complexe pendant la consultation

**Business Goal:** BG1 — Réseau vétérinaires — flywheel propriétaires → vétérinaires → propriétaires activé.

---

## Scenario Steps

| Step | Folder | Purpose | Exit Action |
|------|--------|---------|-------------|
| 07.1 | `07.1-partage-veterinaire/` | Camille génère et envoie le lien | Lien envoyé par email |
| 07.2 | `07.2-login-inscription-veterinaire/` | Dr. Martin ouvre le lien + crée son portail | Portail créé, Pixel lié ✓ |

**Step 07.1** inclut le contexte d'entrée complet (Q3 + Q4 + Q5 + Q6).
