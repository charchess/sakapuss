# Architecture Addendum — Sprint 6 — Mobile Autonome (Local-First)

**Date :** 2026-04-19

## Contexte & Pivot

Jusqu'ici, l'app mobile React Native était un client léger du backend FastAPI (auth obligatoire, zéro stockage local). Ce sprint introduit un pivot **local-first** : l'app fonctionne entièrement hors-ligne, le compte est optionnel, la synchronisation est un service additionnel.

---

## Décisions Architecturales

### 1. Stockage Local — `expo-sqlite` + Drizzle ORM

- **Librairie** : `expo-sqlite` v14 (API synchrone + asynchrone, inclus dans Expo SDK 52)
- **ORM** : `drizzle-orm` avec `drizzle-kit` pour les migrations
- **Rationale** : `expo-sqlite` est first-party Expo, stable, performant. Drizzle offre une API TypeScript type-safe proche de SQL sans magie cachée.

**Schéma local** (miroir simplifié du backend + champs de sync) :

```typescript
// db/schema.ts
export const pets = sqliteTable('pets', {
  id: text('id').primaryKey(),           // UUID généré localement
  name: text('name').notNull(),
  species: text('species').notNull(),
  birth_date: text('birth_date'),
  breed: text('breed'),
  created_at: integer('created_at'),
  sync_status: text('sync_status').default('pending'), // pending | synced | conflict
  server_id: text('server_id'),          // ID côté backend après sync
});

export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  pet_id: text('pet_id').notNull(),
  type: text('type').notNull(),
  payload: text('payload').notNull(),    // JSON stringifié
  occurred_at: integer('occurred_at'),
  created_at: integer('created_at'),
  sync_status: text('sync_status').default('pending'),
  server_id: text('server_id'),
});

export const reminders = sqliteTable('reminders', {
  id: text('id').primaryKey(),
  pet_id: text('pet_id').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  next_due_date: text('next_due_date'),
  status: text('status').default('upcoming'),
  sync_status: text('sync_status').default('pending'),
  server_id: text('server_id'),
});

export const tracking_config = sqliteTable('tracking_config', {
  key: text('key').primaryKey(),         // 'weight', 'food', 'litter', etc.
  enabled: integer('enabled').default(1),
  config: text('config'),                // JSON pour les paramètres avancés
});
```

### 2. Couche Repository (Data Layer)

Toute l'UI passe par le Repository — jamais d'appels directs à l'API. Le Repository décide lui-même s'il lit/écrit en local ou en réseau.

```typescript
// repositories/PetRepository.ts
interface IPetRepository {
  getAll(): Promise<Pet[]>;
  getById(id: string): Promise<Pet | null>;
  create(data: CreatePetInput): Promise<Pet>;
  update(id: string, data: Partial<Pet>): Promise<Pet>;
  delete(id: string): Promise<void>;
}

// Implémentation : local-first
class PetRepository implements IPetRepository {
  async create(data: CreatePetInput): Promise<Pet> {
    const pet = { ...data, id: uuid(), sync_status: 'pending', created_at: Date.now() };
    await db.insert(pets).values(pet);
    SyncQueue.enqueue('pet:create', pet); // notifie le moteur de sync
    return pet;
  }
  // getAll() lit toujours le DB local
  // update/delete idem — local d'abord, sync après
}
```

### 3. Moteur de Synchronisation

**Stratégie** : push-pull asynchrone, déclenchée par :
- Reconnexion réseau (NetInfo event)
- Passage en premier plan de l'app (AppState event)
- Manuellement par l'utilisateur (pull-to-refresh)

**Résolution de conflits** : Last-Write-Wins côté serveur. Le serveur est autoritaire — si conflit, la version serveur écrase le local et `sync_status` passe à `synced`.

```typescript
// sync/SyncEngine.ts
class SyncEngine {
  async push(): Promise<void> {
    // 1. Lire tous les enregistrements sync_status = 'pending'
    const pendingPets = await db.select().from(pets).where(eq(pets.sync_status, 'pending'));
    for (const pet of pendingPets) {
      try {
        const result = pet.server_id
          ? await api.updatePet(pet.server_id, pet)
          : await api.createPet(pet);
        await db.update(pets)
          .set({ sync_status: 'synced', server_id: result.id })
          .where(eq(pets.id, pet.id));
      } catch (e) {
        // garde pending, retry au prochain cycle
      }
    }
    // Idem pour events, reminders
  }

  async pull(): Promise<void> {
    // Récupère les données serveur depuis la dernière sync
    const serverPets = await api.getPets();
    for (const serverPet of serverPets) {
      const local = await db.select().from(pets).where(eq(pets.server_id, serverPet.id));
      if (!local.length) {
        await db.insert(pets).values({ ...serverPet, id: uuid(), server_id: serverPet.id, sync_status: 'synced' });
      }
      // mise à jour si serveur plus récent
    }
  }
}
```

### 4. Flux d'Authentification Optionnelle

```
App Launch
    │
    ▼
[Local DB exists?]
    ├─ OUI → Skip onboarding → Dashboard
    └─ NON
        │
        ▼
    WelcomeScreen
        ├─ "Continuer sans compte" → Config Wizard → Dashboard (mode local)
        └─ "Créer un compte" / "Se connecter"
                │
                ▼
            AuthScreen → Config Wizard → Dashboard (mode sync actif)
```

**Storage des tokens** : `expo-secure-store` (Keychain iOS / Keystore Android).

**Mode sans compte** : `auth_token = null` dans le store. Le SyncEngine s'arrête immédiatement si `!isAuthenticated`.

### 5. Configuration Wizard (Onboarding)

Écran "Que voulez-vous suivre ?" avec toggles par catégorie. Chaque catégorie activée affiche un panneau de configuration expandable.

```
┌─────────────────────────────────────────┐
│  Que souhaitez-vous suivre ?            │
├─────────────────────────────────────────┤
│  ⚖️  Poids                    [ON]  ▼  │
│     │ Fréquence : Hebdomadaire         │
│     │ Unité : grammes                  │
├─────────────────────────────────────────┤
│  🍽️  Alimentation             [ON]  ▼  │
│     │ Suivi croquettes : OUI           │
│     │ Suivi eau : OUI                  │
├─────────────────────────────────────────┤
│  🚽  Litière                  [ON]  ─  │
├─────────────────────────────────────────┤
│  💊  Médicaments/Rappels      [ON]  ─  │
├─────────────────────────────────────────┤
│  🐾  Comportement             [OFF] ─  │
└─────────────────────────────────────────┘
         [ Commencer → ]
```

La config est stockée dans la table `tracking_config` et détermine quels boutons apparaissent sur le dashboard.

---

## Structure de fichiers Mobile

```
mobile/src/
├── db/
│   ├── schema.ts              # Drizzle schema
│   ├── migrations/            # Drizzle migrations auto-générées
│   └── client.ts              # Instance expo-sqlite + drizzle
├── repositories/
│   ├── PetRepository.ts
│   ├── EventRepository.ts
│   ├── ReminderRepository.ts
│   └── ConfigRepository.ts
├── sync/
│   ├── SyncEngine.ts
│   ├── SyncQueue.ts
│   └── useSyncStatus.ts       # Hook React pour l'UI
├── screens/
│   ├── WelcomeScreen.tsx      # NOUVEAU
│   ├── ConfigWizardScreen.tsx # NOUVEAU
│   ├── AuthScreen.tsx         # MODIFIÉ (devient optionnel)
│   └── ...existing screens
├── navigation/
│   └── RootNavigator.tsx      # MODIFIÉ (onboarding flow)
└── api/
    └── client.ts              # Inchangé (utilisé par SyncEngine uniquement)
```

---

## Nouveaux Packages

```json
{
  "expo-sqlite": "^14.0.0",
  "drizzle-orm": "^0.39.0",
  "drizzle-kit": "^0.30.0",
  "expo-secure-store": "^14.0.0",
  "@react-native-community/netinfo": "^11.0.0"
}
```

`expo-sqlite` et `expo-secure-store` sont déjà dans l'Expo SDK 52 — pas de rebuild natif nécessaire.

---

## Impact sur l'Architecture Existante

| Composant | Impact |
|---|---|
| Backend FastAPI | Aucun changement. Il devient le serveur de sync. |
| Web SvelteKit | Aucun changement. |
| Mobile API client | Réduit à un rôle de transport pour SyncEngine. |
| Mobile screens | WelcomeScreen + ConfigWizardScreen à créer. AuthScreen devient optionnel. |
| Mobile navigation | RootNavigator à modifier pour le flow onboarding. |
