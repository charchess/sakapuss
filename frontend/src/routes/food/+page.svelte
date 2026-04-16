<script lang="ts">
  let { data } = $props();

  import { getApiUrl } from '$lib/api';

  const API_URL = getApiUrl();

  let products = $state(data.products);
  let bags = $state(data.bags);

  // Bag creation form state
  let showBagForm = $state(false);
  let bagProductId = $state('');
  let bagWeight = $state('');
  let bagDate = $state('');

  function productName(productId: string): string {
    const p = products.find((pr: any) => pr.id === productId);
    return p ? `${p.brand} ${p.name}` : productId;
  }

  async function handleAddBag(e: Event) {
    e.preventDefault();

    const res = await fetch(`${API_URL}/food/bags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: bagProductId,
        weight_g: parseInt(bagWeight),
        purchased_at: bagDate,
      }),
    });

    if (res.ok) {
      const newBag = await res.json();
      bags = [newBag, ...bags];
      showBagForm = false;
      bagProductId = '';
      bagWeight = '';
      bagDate = '';
    }
  }

  async function openBag(bagId: string) {
    const res = await fetch(`${API_URL}/food/bags/${bagId}/open`, { method: 'POST' });
    if (res.ok) {
      const updated = await res.json();
      bags = bags.map((b: any) => b.id === bagId ? updated : b);
    }
  }

  async function depleteBag(bagId: string) {
    const res = await fetch(`${API_URL}/food/bags/${bagId}/deplete`, { method: 'POST' });
    if (res.ok) {
      const updated = await res.json();
      bags = bags.map((b: any) => b.id === bagId ? updated : b);
    }
  }
</script>

<svelte:head>
  <title>Alimentation — Sakapuss</title>
</svelte:head>

<section class="food-page">
  <a href="/" class="back-link">← Dashboard</a>

  <div class="section-header">
    <h1>Alimentation</h1>
  </div>

  <!-- Products Section -->
  <div class="subsection">
    <div class="subsection-header">
      <h2>Produits</h2>
      <a href="/food/products/new" class="btn-add" data-testid="add-product-btn">+ Produit</a>
    </div>

    {#if products.length === 0}
      <p class="empty">Aucun produit alimentaire défini.</p>
    {:else}
      <div class="product-list">
        {#each products as product}
          <div class="product-card">
            <div class="product-info">
              <strong>{product.brand}</strong> — {product.name}
              <span class="product-meta">{product.food_type} · {product.food_category}</span>
            </div>
            {#if product.default_bag_weight_g}
              <span class="product-weight">{(product.default_bag_weight_g / 1000).toFixed(1)} kg</span>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Bags Section -->
  <div class="subsection">
    <div class="subsection-header">
      <h2>Stock de sacs</h2>
      <button class="btn-add" data-testid="add-bag-btn" onclick={() => { showBagForm = !showBagForm; }}>
        + Sac
      </button>
    </div>

    {#if showBagForm}
      <form class="bag-form" onsubmit={handleAddBag}>
        <select data-testid="bag-product" bind:value={bagProductId} required>
          <option value="" disabled>Choisir un produit</option>
          {#each products as p}
            <option value={p.id}>{p.brand} — {p.name}</option>
          {/each}
        </select>
        <input data-testid="bag-weight" type="number" placeholder="Poids (g)" bind:value={bagWeight} required />
        <input data-testid="bag-date" type="date" bind:value={bagDate} required />
        <button type="submit" class="btn-submit" data-testid="bag-submit">Ajouter</button>
      </form>
    {/if}

    {#if bags.length === 0}
      <p class="empty">Aucun sac en stock.</p>
    {:else}
      <div class="bag-list">
        {#each bags as bag}
          <div class="bag-card">
            <div class="bag-info">
              <strong>{productName(bag.product_id)}</strong>
              <span class="bag-weight">{(bag.weight_g / 1000).toFixed(1)} kg</span>
              <span class="bag-date">Acheté le {bag.purchased_at}</span>
            </div>
            <div class="bag-actions">
              <span
                class="bag-status"
                data-testid="bag-status-{bag.status}"
              >
                {bag.status === 'stocked' ? 'En stock' : bag.status === 'opened' ? 'Ouvert' : 'Terminé'}
              </span>
              {#if bag.status === 'stocked'}
                <button class="btn-action" data-testid="bag-open-btn" onclick={() => openBag(bag.id)}>
                  Ouvrir
                </button>
              {/if}
              {#if bag.status === 'opened'}
                <button class="btn-action btn-deplete" data-testid="bag-deplete-btn" onclick={() => depleteBag(bag.id)}>
                  Épuisé
                </button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</section>

<style>
  .food-page {
    max-width: 640px;
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

  .section-header h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: calc(var(--space-unit) * 3);
    color: var(--color-neutral-900);
  }

  .subsection {
    margin-bottom: calc(var(--space-unit) * 4);
  }

  .subsection-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: calc(var(--space-unit) * 2);
  }

  .subsection-header h2 {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-neutral-700);
  }

  .btn-add {
    display: inline-flex;
    align-items: center;
    padding: calc(var(--space-unit) / 2) calc(var(--space-unit) * 1.5);
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    font-weight: 600;
    font-size: 0.8rem;
    cursor: pointer;
    text-decoration: none;
  }

  .btn-add:hover {
    background: var(--color-primary-dark);
    text-decoration: none;
  }

  .empty {
    color: var(--color-neutral-500);
    text-align: center;
    padding: calc(var(--space-unit) * 3) 0;
  }

  .product-list, .bag-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-unit);
  }

  .product-card, .bag-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    border-radius: var(--radius);
    padding: calc(var(--space-unit) * 2);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }

  .product-info, .bag-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .product-meta, .bag-weight, .bag-date {
    font-size: 0.75rem;
    color: var(--color-neutral-500);
  }

  .product-weight {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-neutral-700);
  }

  .bag-actions {
    display: flex;
    align-items: center;
    gap: var(--space-unit);
  }

  .bag-status {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: 9999px;
    background: var(--color-neutral-100);
    color: var(--color-neutral-600, #6B7280);
  }

  .btn-action {
    padding: calc(var(--space-unit) / 2) calc(var(--space-unit) * 1.5);
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
  }

  .btn-action:hover {
    opacity: 0.9;
  }

  .btn-deplete {
    background: var(--color-error);
  }

  .bag-form {
    display: flex;
    gap: var(--space-unit);
    flex-wrap: wrap;
    padding: calc(var(--space-unit) * 2);
    background: var(--color-neutral-50);
    border-radius: var(--radius);
    margin-bottom: calc(var(--space-unit) * 2);
  }

  .bag-form select,
  .bag-form input {
    padding: calc(var(--space-unit) * 1.5);
    border: 2px solid var(--color-neutral-200);
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    flex: 1;
    min-width: 120px;
  }

  .bag-form select:focus,
  .bag-form input:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  .btn-submit {
    padding: calc(var(--space-unit) * 1.5);
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    font-weight: 600;
    cursor: pointer;
  }

  .btn-submit:hover {
    background: var(--color-primary-dark);
  }
</style>
