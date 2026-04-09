# Rétrospective — Sprint 1 (Epics 1–5)

**Date :** 2026-03-09
**Scope :** MVP initial — 5 epics, 20 stories, 82 tests (50 API + 32 E2E)

---

## Ce qui a bien fonctionné

- **ATDD discipline** : Le cycle RED → GREEN a permis de détecter des bugs avant qu'ils ne s'accumulent (ex: Svelte 5 hydration timing, Vite proxy conflicts, SQLite FK enforcement)
- **Architecture modulaire** : La séparation FastAPI modules (pets, health, mqtt, commands, tags) a permis d'ajouter des features sans toucher au code existant
- **Couverture test solide** : 82 tests couvrant API + E2E, zero régression sur le run final
- **Stack technique** : SvelteKit 2 + FastAPI + SQLite est léger, rapide à itérer, adapté au self-hosted

## Ce qui a posé problème

| Problème | Impact | Résolution |
|----------|--------|------------|
| Svelte 5 SSR hydration timing | Tests E2E flaky — clicks avant hydration JS | `waitUntil: 'networkidle'` sur tous les `goto()` |
| Vite proxy intercepte les routes SvelteKit | Navigation `/pets/xxx` cassée côté client | Suppression proxy, URLs absolues dans load functions |
| SQLite locking sous workers parallèles | Tests flaky en parallèle | `--workers=1` pour E2E |
| `$state()` reactivity warnings | `state_referenced_locally` pour `data` | Non bloquant mais devrait utiliser `$derived` |
| Alembic autogenerate vide sur SQLite | Migrations manuelles nécessaires | Écriture manuelle du SQL |

## Leçons apprises

1. **Svelte 5 runes** : `$state()` fonctionne globalement dans le template (même hors `<section>`), mais l'hydration SSR→client prend du temps — les tests doivent attendre
2. **SQLite en dev** : Suffisant pour un seul utilisateur self-hosted, mais les contraintes FK et le locking imposent des précautions
3. **CORS** : Nécessaire dès qu'on sépare frontend/backend sur des ports différents, y compris en SSR (SvelteKit fetch)

## Lacunes produit identifiées (feedback utilisateur)

### Manques critiques
- **Pas d'onboarding UI** : Impossible de créer un animal via l'interface — uniquement via API (`POST /pets`). L'utilisateur final ne peut pas utiliser l'app de façon autonome
- **Pas d'édition/suppression d'animal via UI** : Les routes API existent (PUT, DELETE) mais aucun formulaire frontend

### Manques fonctionnels (nouveaux besoins)
- **Gestion du stock de nourriture** : Pas de suivi des achats de croquettes, pas de cycle "sac de croquettes" (date achat, poids, estimation de consommation, alerte stock bas)
- **Remplissage des gamelles** : Pas de log de la quantité servie par repas, pas de suivi de la consommation journalière
- **Pas de gestion multi-utilisateurs** : Un seul "propriétaire" implicite, pas de partage entre membres du foyer

### Améliorations UX souhaitables
- **Navigation** : Pas de lien vers la vue vétérinaire depuis le profil animal
- **Responsive** : Non testé sur mobile réel (seulement viewport Playwright)
- **Formulaire d'ajout d'événement** : Limité aux 4 actions rapides — pas de formulaire libre pour ajouter un vaccin, traitement, note avec date personnalisée

## Recommandation

Lancer un **nouveau cycle produit** (Phase 1–4 BMAD) centré sur :
1. **Epic 6 : Onboarding & Gestion Multi-Animaux (UI)** — formulaires CRUD complets
2. **Epic 7 : Gestion Alimentation & Stock** — modèle inventory, cycle croquettes, alertes HA
3. Réévaluer l'architecture si le modèle de données s'enrichit significativement
