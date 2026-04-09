<script lang="ts">
  import { goto } from '$app/navigation';
  import { getApiUrl } from '$lib/api';

  const API_URL = getApiUrl();

  let name = $state('');
  let brand = $state('');
  let foodType = $state('');
  let foodCategory = $state('');
  let defaultWeight = $state('');
  let submitting = $state(false);
  let error = $state('');

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (submitting) return;
    submitting = true;
    error = '';

    const body: Record<string, any> = {
      name,
      brand,
      food_type: foodType,
      food_category: foodCategory,
    };
    if (defaultWeight) body.default_bag_weight_g = parseInt(defaultWeight);

    try {
      const res = await fetch(`${API_URL}/food/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        error = data?.detail || `Erreur ${res.status}`;
        submitting = false;
        return;
      }

      window.location.href = '/food';
    } catch (err) {
      error = 'Erreur réseau';
      submitting = false;
    }
  }
</script>

<svelte:head>
  <title>Nouveau produit — Sakapuss</title>
</svelte:head>

<section class="product-form-page">
  <a href="/food" class="back-link">← Retour</a>

  <h1>Ajouter un produit alimentaire</h1>

  {#if error}
    <div class="form-error">{error}</div>
  {/if}

  <form onsubmit={handleSubmit}>
    <div class="form-group">
      <label for="product-name">Nom *</label>
      <input id="product-name" data-testid="product-name" type="text" required bind:value={name} placeholder="ex: Quinoa Caille" />
    </div>

    <div class="form-group">
      <label for="product-brand">Marque *</label>
      <input id="product-brand" data-testid="product-brand" type="text" required bind:value={brand} placeholder="ex: Farmina" />
    </div>

    <div class="form-group">
      <label for="product-type">Type *</label>
      <input id="product-type" data-testid="product-type" type="text" required bind:value={foodType} placeholder="ex: kibble, wet, treats" />
    </div>

    <div class="form-group">
      <label for="product-category">Catégorie *</label>
      <input id="product-category" data-testid="product-category" type="text" required bind:value={foodCategory} placeholder="ex: main, pleasure" />
    </div>

    <div class="form-group">
      <label for="product-weight">Poids par défaut du sac (g)</label>
      <input id="product-weight" data-testid="product-weight" type="number" bind:value={defaultWeight} placeholder="ex: 7000" />
    </div>

    <button type="submit" class="btn-submit" data-testid="product-submit" disabled={submitting}>
      {submitting ? 'Enregistrement…' : 'Créer le produit'}
    </button>
  </form>
</section>

<style>
  .product-form-page {
    max-width: 540px;
  }

  .back-link {
    display: inline-block;
    color: var(--color-primary);
    font-size: 0.875rem;
    margin-bottom: calc(var(--space-unit) * 3);
  }

  .back-link:hover {
    text-decoration: underline;
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: calc(var(--space-unit) * 3);
    color: var(--color-neutral-900);
  }

  .form-error {
    background: #FEF2F2;
    border: 1px solid #FECACA;
    border-radius: var(--radius-sm);
    padding: calc(var(--space-unit) * 1.5);
    color: #991B1B;
    font-size: 0.875rem;
    margin-bottom: calc(var(--space-unit) * 2);
  }

  form {
    display: flex;
    flex-direction: column;
    gap: calc(var(--space-unit) * 2);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: calc(var(--space-unit) / 2);
  }

  .form-group label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-neutral-700);
  }

  .form-group input {
    padding: calc(var(--space-unit) * 1.5);
    border: 2px solid var(--color-neutral-200);
    border-radius: var(--radius-sm);
    font-size: 1rem;
    background: white;
  }

  .form-group input:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  .btn-submit {
    padding: calc(var(--space-unit) * 1.5);
    background: var(--color-accent);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    margin-top: var(--space-unit);
  }

  .btn-submit:hover:not(:disabled) {
    background: #059669;
  }

  .btn-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
