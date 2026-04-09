# Architecture Addendum — Sprint 2

**Date :** 2026-03-09

## Impact Analysis

Sprint 2 introduces significant new domain models. The existing architecture (monolith with internal modules) scales well — we add new modules under `backend/app/modules/`.

### Existing modules (no changes needed)
- `modules/pets/` — Pet CRUD (needs schema extension for new fields)
- `modules/health/` — Events, Reminders (no changes)
- `core/mqtt/` — MQTT bridge (no changes)

### New modules

#### `modules/food/` — Food Stock & Bowl Management

**New DB Models:**

```
FoodProduct
├── id: UUID (PK)
├── name: str (e.g., "Farmina Quinoa Caille")
├── brand: str
├── food_type: str (configurable — kibble, wet, treats, etc.)
├── food_category: str (configurable — main, pleasure)
├── default_bag_weight_g: int | null
├── created_at: datetime
└── updated_at: datetime

FoodBag (lifecycle: purchased → opened → depleted)
├── id: UUID (PK)
├── product_id: UUID (FK → FoodProduct)
├── weight_g: int (bag weight in grams)
├── purchased_at: date
├── opened_at: date | null
├── depleted_at: date | null
├── status: enum (stocked, opened, depleted)
├── created_at: datetime
└── updated_at: datetime

Bowl
├── id: UUID (PK)
├── name: str (e.g., "Salon A")
├── location: str (e.g., "Salon")
├── capacity_g: int | null (grams for food, ml for water)
├── bowl_type: enum (food, water)
├── current_product_id: UUID | null (FK → FoodProduct)
├── created_at: datetime
└── updated_at: datetime

Serving (each time a bowl is filled)
├── id: UUID (PK)
├── bowl_id: UUID (FK → Bowl)
├── bag_id: UUID | null (FK → FoodBag, null for water)
├── pet_id: UUID | null (FK → Pet, null if shared)
├── served_at: datetime
├── amount_g: int | null (optional weight estimate)
├── notes: str | null (e.g., "Vanille a mangé la part de Mina")
├── created_at: datetime
└── updated_at: datetime
```

#### `modules/relations/` — Inter-Animal Relations

Leverages the existing `Event` polymorphic model. No new table needed — uses event `type: 'relation'` with payload:
```json
{
  "subject_pet_id": "uuid-vanille",
  "verb": "fights_with",
  "object_pet_id": "uuid-mina",
  "text": "Vanille s'est chamaillée avec Mina pour la gamelle"
}
```

### Pet Schema Extension

Add to `Pet` model (migration required):
- `breed: str | null`
- `sterilized: bool | null`
- `microchip: str | null`
- `vet_name: str | null`
- `vet_phone: str | null`

### New API Routes

```
# Food Products
GET    /food/products
POST   /food/products
PUT    /food/products/{id}
DELETE /food/products/{id}

# Food Bags
GET    /food/bags                    (filter: ?status=opened)
POST   /food/bags
PUT    /food/bags/{id}               (update status, dates)
POST   /food/bags/{id}/open          (mark as opened)
POST   /food/bags/{id}/deplete       (mark as depleted)
GET    /food/bags/{id}/estimate      (consumption estimate)

# Bowls
GET    /bowls
POST   /bowls
PUT    /bowls/{id}
DELETE /bowls/{id}

# Servings
POST   /bowls/{id}/fill              (log a serving)
GET    /bowls/{id}/servings          (history)
GET    /pets/{id}/servings           (per-animal consumption)

# Configurable Types
GET    /food/types                   (list food types)
POST   /food/types                   (create custom type)
GET    /food/categories              (list food categories)
POST   /food/categories              (create custom category)
```

### Frontend New Routes

```
/pets/new                    → Create pet form
/pets/[id]/edit              → Edit pet form
/food                        → Food stock dashboard (bags, products)
/food/products/new           → Add food product
/bowls                       → Bowl management
```

### Migration Strategy

One migration for Pet schema extension, one for Food module tables. Sequential, non-breaking.

### Estimation Algorithms

**Daily consumption estimate:**
```
daily_consumption_g = total_served_g / days_since_opened
```

**Depletion date estimate:**
```
remaining_g = bag_weight_g - total_served_g
days_remaining = remaining_g / daily_consumption_g
estimated_depletion = today + days_remaining
```

These are approximations — exact tracking requires the user to always log servings and occasionally weigh the bag.
