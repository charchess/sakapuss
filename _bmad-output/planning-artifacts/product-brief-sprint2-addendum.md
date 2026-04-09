# Product Brief Addendum — Sprint 2

**Date :** 2026-03-09
**Author :** Charchess
**Context :** Post-Sprint 1 (MVP livré, 20 stories, 82 tests). Besoins utilisateur identifiés lors du premier test fonctionnel.

---

## Nouveaux besoins identifiés

### 1. Onboarding & Gestion Animaux via UI

**Problème :** L'utilisateur ne peut pas créer/éditer/supprimer un animal depuis l'interface — uniquement via API. L'app est inutilisable pour un utilisateur non-technique.

**Solution :** Formulaires CRUD complets dans l'UI avec tous les champs du profil :
- Champs existants API : nom, espèce, date de naissance, photo
- Nouveaux champs à ajouter : **race**, **poids initial**, **stérilisé (oui/non)**, **numéro de puce/tatouage**, **vétérinaire traitant** (nom + téléphone)

### 2. Gestion du Stock Alimentaire (cycle de vie complet)

**Problème :** Aucun suivi de la nourriture : pas d'inventaire des sacs, pas de traçabilité de la consommation, pas d'alertes stock bas.

**Solution — Modèle "Cycle de Vie du Sac" :**

Le scénario utilisateur type :
1. "Le 15 janvier j'ai **acheté** un sac de 5kg de Farmina Quinoa Caille (croquettes)"
2. "Le 10 février je l'ai **ouvert/commencé**"
3. "Chaque jour je clique **remplir** quand je remplis une gamelle (poids optionnel par gamelle)"
4. "Le 15 juillet je constate que le sac est **vide**"

**Concepts clés :**
- **Produit alimentaire** : marque, gamme, poids du sac, type (configurable : croquettes, pâtée, friandises...), catégorie (configurable : principale vs plaisir)
- **Stock** : plusieurs sacs en stock simultanément, statut (en stock / ouvert / terminé)
- **Estimation** : consommation quotidienne estimée, date de fin prévue, alerte HA quand stock < X jours
- **Historique** : traçabilité complète des sacs achetés/consommés

### 3. Gestion des Gamelles (multi-gamelles, multi-lieux)

**Problème :** Pas de suivi du remplissage des gamelles, pas de distinction entre les gamelles.

**Scénario utilisateur :**
> "J'ai 2 gamelles dans le salon avec parfum A et B, et 2 autres dans leur salle avec les mêmes parfums mais poids différent"

**Concepts clés :**
- **Gamelle** : nom/lieu, contenance, type de nourriture associée
- **Log de remplissage** : 1-tap "remplir" avec estimation optionnelle du poids servi
- **Suivi de consommation par animal** : qui a mangé quoi, combien — avec scénarios type "Vanille a tout mangé + la part de sa sœur"

### 4. Gestion de l'Eau

**Problème :** Pas de suivi de l'hydratation.

**Solution :** Même logique que les gamelles mais pour l'eau :
- Contenants avec volume/hauteur
- Volume consommé déduit de la taille du contenant
- Log de remplissage

### 5. Formulaire d'Événement Libre

**Problème :** Les 4 boutons d'action rapide ne couvrent pas tous les cas (ajout de vaccin avec date custom, traitement, note libre).

**Solution :** Formulaire complet permettant de créer n'importe quel type d'événement avec date personnalisée, payload libre.

### 6. Relations Inter-Animaux

**Problème :** Pas de moyen de noter les interactions entre animaux.

**Solution :** Événements relationnels — "X sort", "X dort", "X se chamaille avec Y", commentaires comportementaux croisés.

### 7. Navigation Améliorée

- Lien vers la vue vétérinaire depuis le profil animal
- Switch rapide entre animaux
- Vue comparative multi-animaux

---

## Priorisation Sprint 2

| Priorité | Feature | Justification |
|----------|---------|---------------|
| P0 | Onboarding UI (CRUD animal) | Bloquant — app inutilisable sans ça |
| P0 | Formulaire d'événement libre | Bloquant — seuls 4 types d'événements accessibles via UI |
| P0 | Stock alimentaire (cycle sac) | Besoin principal exprimé par l'utilisateur |
| P0 | Gamelles & eau | Complément direct du stock alimentaire |
| P1 | Relations inter-animaux | Enrichissement du journal comportemental |
| P1 | Navigation améliorée (switch animal, lien véto) | UX improvement |
