# 01 : Camille s'installe

**Project:** Sakapuss
**Created:** 2026-04-07
**Method:** Whiteport Design Studio (WDS)
**Design Intent:** D (Dream Up)
**Design Status:** not-started

---

## Transaction (Q1)

**What this scenario covers:**
Camille crée son compte, définit ses animaux, et amorce la configuration selon son rythme — sans bloquer, sans friction obligatoire. Elle sort de l'onboarding avec ses chats dans le système et au moins un rappel planifié.

---

## Business Goal (Q2)

**Goal:** BG0 — THE ENGINE : 100 Propriétaires Actifs en 6 mois
**Objective:** Utilisateur activé avec données initiales présentes + au moins 1 rappel configuré — les deux métriques de rétention BG0 amorcées dès le premier soir.

---

## User & Situation (Q3)

**Persona:** Camille la Gardienne (Primary)
**Situation:** Camille arrive sur Sakapuss un soir chez elle, téléphone en main — soit via un lien de son vétérinaire, soit après avoir cherché "app suivi santé chat", soit après une frustration concrète (oubli de vermifuge, blanc en consultation). Dans tous les cas : motivation fraîche, patience limitée.

---

## Driving Forces (Q4)

**Hope:** Enfin un système fiable qui prend en charge ce qu'elle oublie — elle veut ressortir de l'onboarding en sentant que ses chats sont "dans le système".

**Worry:** Que ce soit trop long ou trop compliqué, qu'elle abandonne au milieu comme avec les autres apps, et se retrouve avec un compte à moitié configuré qui ne sert à rien.

---

## Device & Starting Point (Q5 + Q6)

**Device:** Mobile
**Entry:** Camille ouvre le lien reçu de son vétérinaire (ou trouve l'app en cherchant "suivi santé chat" sur mobile), atterrit sur la page d'inscription un soir à la maison, téléphone en main.

---

## Best Outcome (Q7)

**User Success:** Camille ressort de l'onboarding avec ses deux chats dans le système et au moins un rappel santé planifié — elle peut fermer l'app en sachant que Sakapuss s'occupe de ne pas oublier à sa place.

**Business Success:** Utilisateur activé avec profil animal complet et rappel configuré — les deux métriques BG0 (saisies régulières + rappel présent) sont amorcées dès la première session.

---

## Shortest Path (Q8)

1. **Inscription** — Camille crée son compte (email + mot de passe, ou lien vétérinaire direct). *(Login = storyboard item pour les retours)*
2. **Ajout animal** — Elle définit Pixel puis Luna : nom + espèce (obligatoire), race / date de naissance / numéro de puce / vétérinaire (optionnel, avec possibilité de lier un profil vétérinaire interne partagé par son cabinet).
3. **Onboarding Admin** — L'app propose les parcours de configuration selon l'espèce : rappels santé standards (vermifuge, antipuce, vaccins), poids initial, ressources alimentaires. Camille configure les rappels santé, skippe les autres pour plus tard. ✓

---

## Trigger Map Connections

**Persona:** Camille la Gardienne (Primary)

**Driving Forces Addressed:**
- ✅ **Want:** Ne plus jamais oublier un soin important
- ❌ **Fear:** Adopter une app trop compliquée et l'abandonner

**Business Goal:** BG0 — THE ENGINE — 100 Propriétaires Actifs en 6 mois. Métriques : 4 semaines de saisies régulières + au moins 1 rappel configuré.

---

## Scenario Steps

| Step | Folder | Purpose | Exit Action |
|------|--------|---------|-------------|
| 01.1 | `01.1-inscription/` | Créer le compte | Valide l'inscription → onboarding |
| 01.2 | `01.2-ajout-animal/` | Définir les animaux | Confirme le(s) animal(aux) → parcours config |
| 01.3 | `01.3-onboarding-admin/` | Configurer les rappels santé standards | Valide au moins un rappel → Sakapuss prêt ✓ |

**Step 01.1** inclut le contexte d'entrée complet (Q3 + Q4 + Q5 + Q6).
**Paramètres / Compte** (vue 16) documenté comme storyboard item accessible depuis l'onboarding (profil, notifications).
