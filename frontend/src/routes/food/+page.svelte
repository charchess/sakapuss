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

  function getToken(): string | null {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  }

  function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
    const t = getToken();
    return { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}), ...extra };
  }

  function productName(productId: string): string {
    const p = products.find((pr: any) => pr.id === productId);
    return p ? p.name : productId;
  }

  function productBrand(productId: string): string {
    const p = products.find((pr: any) => pr.id === productId);
    return p ? p.brand : '';
  }

  async function handleAddBag(e: Event) {
    e.preventDefault();

    const res = await fetch(`${API_URL}/food/bags`, {
      method: 'POST',
      headers: authHeaders(),
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
    const res = await fetch(`${API_URL}/food/bags/${bagId}/open`, {
      method: 'POST',
      headers: authHeaders(),
    });
    if (res.ok) {
      const updated = await res.json();
      bags = bags.map((b: any) => b.id === bagId ? updated : b);
    }
  }

  async function depleteBag(bagId: string) {
    const res = await fetch(`${API_URL}/food/bags/${bagId}/deplete`, {
      method: 'POST',
      headers: authHeaders(),
    });
    if (res.ok) {
      const updated = await res.json();
      bags = bags.map((b: any) => b.id === bagId ? updated : b);
    }
  }

  const activeBags = $derived(bags.filter((b: any) => b.status !== 'depleted'));
  const allDepleted = $derived(bags.length > 0 && activeBags.length === 0);

  const STATUS_LABELS: Record<string, string> = {
    stocked: 'En stock',
    opened: 'Ouvert',
    depleted: 'Terminé',
  };

  function formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
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
      <div class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="36" fill="var(--color-primary-soft)"/>
            <rect x="22" y="30" width="36" height="24" rx="4" fill="var(--color-primary-light)" stroke="var(--color-primary)" stroke-width="1.5"/>
            <path d="M28 30v-4a4 4 0 018 0v4" stroke="var(--color-primary)" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M44 30v-4a4 4 0 018 0v4" stroke="var(--color-primary)" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M30 42h20M30 48h12" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <p class="empty-title">Aucun produit défini</p>
        <span class="empty-hint">Ajoute les croquettes ou pâtées que tu utilises</span>
      </div>
    {:else}
      <div class="product-list">
        {#each products as product}
          <div class="product-card">
            <div class="product-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M4 12a8 8 0 0016 0"/><path d="M3 12h18"/>
              </svg>
            </div>
            <div class="product-info">
              <strong class="product-name">{product.name}</strong>
              <span class="product-meta">{product.brand} · {product.food_type} · {product.food_category}</span>
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
      <div class="empty-state empty-state-sm">
        <p class="empty-title">Aucun sac en stock</p>
        <span class="empty-hint">Enregistre tes sacs de croquettes pour suivre le stock</span>
      </div>
    {:else}
      {#if allDepleted}
        <div class="depleted-nudge">
          <span class="depleted-nudge-icon">📦</span>
          <div>
            <p class="empty-title">Plus de stock actif</p>
            <span class="empty-hint">Tous tes sacs sont épuisés — pense à en commander un nouveau !</span>
          </div>
          <button class="btn-add" onclick={() => { showBagForm = true; }}>+ Sac</button>
        </div>
      {/if}
      <div class="bag-list" class:bag-list-depleted={allDepleted}>
        {#each bags as bag}
          <div class="bag-card" class:depleted={bag.status === 'depleted'}>
            <div class="bag-icon" class:opened={bag.status === 'opened'} class:depleted={bag.status === 'depleted'}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M4 12a8 8 0 0016 0"/><path d="M3 12h18"/>
              </svg>
            </div>
            <div class="bag-info">
              <strong class="bag-name">{productName(bag.product_id)}</strong>
              <span class="bag-meta">{productBrand(bag.product_id)} · {(bag.weight_g / 1000).toFixed(1)} kg · {formatDate(bag.purchased_at)}</span>
            </div>
            <div class="bag-actions">
              <span class="bag-status" class:status-stocked={bag.status === 'stocked'} class:status-opened={bag.status === 'opened'} class:status-depleted={bag.status === 'depleted'} data-testid="bag-status-{bag.status}">
                {STATUS_LABELS[bag.status] || bag.status}
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
  .food-page { max-width: 640px; padding: 52px var(--space-lg) var(--space-lg); }

  .back-link {
    display: inline-block; color: var(--color-primary);
    font-size: var(--text-sm); margin-bottom: var(--space-xl);
  }
  .back-link:hover { text-decoration: underline; }

  .section-header { margin-bottom: var(--space-xl); }
  .section-header h1 {
    font-family: var(--font-display); font-size: var(--text-2xl);
    font-weight: 800; color: var(--color-primary);
  }

  .subsection { margin-bottom: var(--space-2xl); }

  .subsection-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: var(--space-lg);
  }
  .subsection-header h2 {
    font-family: var(--font-display); font-size: var(--text-lg); font-weight: 700; color: var(--color-text-primary);
  }

  .btn-add {
    display: inline-flex; align-items: center;
    padding: var(--space-sm) var(--space-lg);
    background: var(--color-primary); color: white;
    border: none; border-radius: var(--radius-lg);
    font-weight: 600; font-size: var(--text-sm); cursor: pointer;
    text-decoration: none; font-family: var(--font-default);
  }
  .btn-add:hover { opacity: 0.9; text-decoration: none; }

  /* Empty states */
  .empty-state {
    display: flex; flex-direction: column; align-items: center;
    text-align: center; padding: var(--space-3xl) var(--space-xl); gap: var(--space-md);
  }
  .empty-state-sm { padding: var(--space-xl) var(--space-xl); }
  .empty-icon svg { width: 80px; height: 80px; }
  .empty-title { font-size: var(--text-md); font-weight: 500; color: var(--color-text-secondary); }
  .empty-hint { font-size: var(--text-sm); color: var(--color-text-muted); max-width: 260px; }

  /* Product list */
  .product-list { display: flex; flex-direction: column; gap: var(--space-md); }
  .product-card {
    display: flex; align-items: center; gap: var(--space-md);
    background: var(--color-surface); border-radius: var(--radius-xl);
    padding: var(--space-lg); box-shadow: var(--elevation-sm);
  }

  .product-icon {
    width: 40px; height: 40px; border-radius: var(--radius-lg);
    background: var(--color-primary-soft);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .product-icon svg { width: 20px; height: 20px; stroke: var(--color-primary); }

  .product-info { flex: 1; min-width: 0; }
  .product-name { display: block; font-size: var(--text-md); font-weight: 600; color: var(--color-text-primary); }
  .product-meta { font-size: var(--text-xs); color: var(--color-text-muted); }
  .product-weight {
    font-size: var(--text-sm); font-weight: 600; color: var(--color-text-secondary);
    flex-shrink: 0;
  }

  /* Depleted nudge */
  .depleted-nudge {
    display: flex; align-items: center; gap: var(--space-md);
    background: rgba(253, 203, 110, 0.12); border: 1.5px dashed rgba(253, 203, 110, 0.6);
    border-radius: var(--radius-xl); padding: var(--space-lg) var(--space-xl);
    margin-bottom: var(--space-lg);
  }
  .depleted-nudge-icon { font-size: 1.6rem; flex-shrink: 0; }
  .depleted-nudge > div { flex: 1; }
  .depleted-nudge .empty-title { font-size: var(--text-sm); margin: 0; text-align: left; }
  .depleted-nudge .empty-hint { font-size: var(--text-xs); text-align: left; }
  .bag-list-depleted { opacity: 0.55; }

  /* Bag list */
  .bag-list { display: flex; flex-direction: column; gap: var(--space-md); }
  .bag-card {
    display: flex; align-items: center; gap: var(--space-md);
    background: var(--color-surface); border-radius: var(--radius-xl);
    padding: var(--space-lg); box-shadow: var(--elevation-sm);
    transition: opacity 0.2s;
  }
  .bag-card.depleted { opacity: 0.6; }

  .bag-icon {
    width: 40px; height: 40px; border-radius: var(--radius-lg);
    background: var(--color-primary-soft);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .bag-icon svg { width: 20px; height: 20px; stroke: var(--color-primary); }
  .bag-icon.opened { background: rgba(253, 203, 110, 0.2); }
  .bag-icon.opened svg { stroke: #e17055; }
  .bag-icon.depleted { background: var(--color-bg); }
  .bag-icon.depleted svg { stroke: var(--color-text-muted); }

  .bag-info { flex: 1; min-width: 0; }
  .bag-name { display: block; font-size: var(--text-md); font-weight: 600; color: var(--color-text-primary); }
  .bag-meta { font-size: var(--text-xs); color: var(--color-text-muted); }

  .bag-actions { display: flex; align-items: center; gap: var(--space-sm); flex-shrink: 0; }

  .bag-status {
    font-size: var(--text-xs); font-weight: 600;
    padding: 2px var(--space-sm); border-radius: var(--radius-full);
    white-space: nowrap;
  }
  .status-stocked { background: rgba(0, 184, 148, 0.12); color: #00b894; }
  .status-opened { background: rgba(253, 203, 110, 0.2); color: #e17055; }
  .status-depleted { background: var(--color-bg); color: var(--color-text-muted); }

  .btn-action {
    padding: var(--space-sm) var(--space-md);
    background: var(--color-primary); color: white;
    border: none; border-radius: var(--radius-lg);
    font-size: var(--text-xs); font-weight: 600; cursor: pointer;
    font-family: var(--font-default); white-space: nowrap;
  }
  .btn-action:hover { opacity: 0.9; }
  .btn-deplete { background: #e17055; }

  /* Bag creation form */
  .bag-form {
    display: flex; gap: var(--space-md); flex-wrap: wrap;
    padding: var(--space-xl); background: var(--color-surface);
    border-radius: var(--radius-xl); box-shadow: var(--elevation-sm);
    margin-bottom: var(--space-lg);
  }
  .bag-form select, .bag-form input {
    padding: var(--space-md); border: 1.5px solid var(--color-border);
    border-radius: var(--radius-lg); font-size: var(--text-sm);
    font-family: var(--font-default); background: var(--color-bg);
    flex: 1; min-width: 120px;
  }
  .bag-form select:focus, .bag-form input:focus {
    outline: none; border-color: var(--color-primary-light);
  }
  .btn-submit {
    padding: var(--space-md) var(--space-lg);
    background: var(--color-primary); color: white;
    border: none; border-radius: var(--radius-lg);
    font-weight: 600; font-size: var(--text-sm); cursor: pointer;
    font-family: var(--font-default);
  }
  .btn-submit:hover { opacity: 0.9; }
</style>
