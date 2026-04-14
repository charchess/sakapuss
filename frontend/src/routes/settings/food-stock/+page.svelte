<script lang="ts">
  import { getApiUrl } from '$lib/api';
  import { onMount } from 'svelte';

  interface Product { id: string; name: string; brand: string | null; }
  interface Bag {
    id: string;
    product_id: string;
    weight_g: number;
    purchased_at: string;
    status: string;
    // Estimate fields (loaded separately for opened bags)
    remaining_g?: number;
    daily_consumption_g?: number;
    estimated_depletion_date?: string;
  }

  let products = $state<Product[]>([]);
  let bags = $state<Bag[]>([]);
  let saved = $state(false);

  let bagProductId = $state('');
  let bagWeightKg = $state('');
  let bagDate = $state(new Date().toISOString().slice(0, 10));

  function getToken(): string | null {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  }
  function authHeaders(): Record<string, string> {
    const token = getToken();
    return token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' };
  }

  async function loadData() {
    const [pRes, bRes] = await Promise.all([
      fetch(`${getApiUrl()}/food/products`),
      fetch(`${getApiUrl()}/food/bags`),
    ]);
    if (pRes.ok) products = await pRes.json();
    if (bRes.ok) {
      bags = await bRes.json();
      // Load estimates for opened bags
      for (const bag of bags) {
        if (bag.status === 'opened') {
          const estRes = await fetch(`${getApiUrl()}/food/bags/${bag.id}/estimate`);
          if (estRes.ok) {
            const est = await estRes.json();
            bag.remaining_g = est.remaining_g;
            bag.daily_consumption_g = est.daily_consumption_g;
            bag.estimated_depletion_date = est.estimated_depletion_date;
          }
        }
      }
      bags = [...bags]; // trigger reactivity
    }
    if (products.length > 0 && !bagProductId) bagProductId = products[0].id;
  }

  onMount(loadData);

  async function addBag() {
    if (!bagProductId || !bagWeightKg) return;
    const res = await fetch(`${getApiUrl()}/food/bags`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({
        product_id: bagProductId,
        weight_g: parseFloat(bagWeightKg) * 1000,
        purchased_at: new Date(bagDate).toISOString(),
      }),
    });
    if (res.ok) {
      await loadData();
      bagWeightKg = '';
      saved = true; setTimeout(() => saved = false, 2000);
    }
  }

  async function openBag(id: string) {
    await fetch(`${getApiUrl()}/food/bags/${id}/open`, { method: 'POST', headers: authHeaders() });
    await loadData();
  }

  async function depleteBag(id: string) {
    await fetch(`${getApiUrl()}/food/bags/${id}/deplete`, { method: 'POST', headers: authHeaders() });
    await loadData();
  }

  function getProductName(pid: string): string {
    const p = products.find(p => p.id === pid);
    return p ? `${p.name}${p.brand ? ` (${p.brand})` : ''}` : '?';
  }

  function statusLabel(s: string): string {
    if (s === 'stocked') return 'En stock';
    if (s === 'opened') return 'Ouvert';
    if (s === 'depleted') return 'Terminé';
    return s;
  }

  function statusColor(s: string): string {
    if (s === 'opened') return 'var(--color-success)';
    if (s === 'depleted') return 'var(--color-text-muted)';
    return 'var(--color-warning)';
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  const openedBags = $derived(bags.filter(b => b.status === 'opened'));
  const stockedBags = $derived(bags.filter(b => b.status === 'stocked'));
  const depletedBags = $derived(bags.filter(b => b.status === 'depleted'));
</script>

<svelte:head><title>Stock — Sakapuss</title></svelte:head>

<div class="config-page">
  <a href="/settings" class="back">← Paramètres</a>
  <h1>Stock de nourriture</h1>
  <p class="subtitle">Tes sacs en cours et en réserve. <a href="/settings/food">Gérer les produits →</a></p>

  {#if products.length === 0}
    <div class="warning">
      Aucun produit configuré. <a href="/settings/food">Ajoute des produits d'abord</a>.
    </div>
  {:else}

    <!-- Opened bags -->
    {#if openedBags.length > 0}
      <h2>Ouvert</h2>
      {#each openedBags as bag}
        <div class="bag-card opened">
          <div class="bag-dot" style="background: {statusColor(bag.status)}"></div>
          <div class="bag-info">
            <strong>{getProductName(bag.product_id)}</strong>
            {#if bag.remaining_g != null}
              <div class="remaining">
                <span class="remaining-value">{(bag.remaining_g / 1000).toFixed(3)} kg restants</span>
                <span class="remaining-bar-bg">
                  <span class="remaining-bar" style="width: {Math.max(2, (bag.remaining_g / bag.weight_g) * 100)}%"></span>
                </span>
              </div>
              {#if bag.daily_consumption_g && bag.daily_consumption_g > 0}
                <span class="consumption">~{bag.daily_consumption_g.toFixed(0)}g/jour{#if bag.estimated_depletion_date} · épuisé le {formatDate(bag.estimated_depletion_date)}{/if}</span>
              {/if}
            {:else}
              <span>{(bag.weight_g / 1000).toFixed(1)} kg · acheté le {formatDate(bag.purchased_at)}</span>
            {/if}
          </div>
          <button class="btn-action" onclick={() => depleteBag(bag.id)}>Terminé</button>
        </div>
      {/each}
    {/if}

    <!-- Stocked bags -->
    {#if stockedBags.length > 0}
      <h2>En réserve</h2>
      {#each stockedBags as bag}
        <div class="bag-card">
          <div class="bag-dot" style="background: {statusColor(bag.status)}"></div>
          <div class="bag-info">
            <strong>{getProductName(bag.product_id)}</strong>
            <span>{(bag.weight_g / 1000).toFixed(1)} kg · acheté le {formatDate(bag.purchased_at)}</span>
          </div>
          <button class="btn-action open" onclick={() => openBag(bag.id)}>Ouvrir</button>
        </div>
      {/each}
    {/if}

    <!-- Depleted bags -->
    {#if depletedBags.length > 0}
      <details class="depleted-section">
        <summary>Terminés ({depletedBags.length})</summary>
        {#each depletedBags as bag}
          <div class="bag-card depleted">
            <div class="bag-dot" style="background: {statusColor(bag.status)}"></div>
            <div class="bag-info">
              <strong>{getProductName(bag.product_id)}</strong>
              <span>{(bag.weight_g / 1000).toFixed(1)} kg</span>
            </div>
          </div>
        {/each}
      </details>
    {/if}

    <!-- Add bag -->
    <div class="add-section">
      <h2>Ajouter un sac</h2>
      <select bind:value={bagProductId} class="select">
        {#each products as p}
          <option value={p.id}>{p.name}{p.brand ? ` (${p.brand})` : ''}</option>
        {/each}
      </select>
      <div class="row">
        <input type="number" step="0.1" bind:value={bagWeightKg} placeholder="Poids" class="input input-sm" />
        <span class="unit">kg</span>
        <input type="date" bind:value={bagDate} class="input input-date" />
      </div>
      <button class="btn-primary" onclick={addBag} disabled={!bagProductId || !bagWeightKg}>Ajouter ce sac</button>
    </div>

    {#if saved}
      <div class="success">Sac ajouté !</div>
    {/if}
  {/if}
</div>

<style>
  .config-page { max-width: 500px; margin: 0 auto; padding: 52px var(--space-lg) var(--space-lg); }
  .back { font-size: var(--text-sm); color: var(--color-primary); text-decoration: none; }
  h1 { font-family: var(--font-display); font-size: var(--text-2xl); margin: var(--space-md) 0 var(--space-xs); }
  h2 { font-size: var(--text-sm); font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin: var(--space-xl) 0 var(--space-sm); }
  .subtitle { font-size: var(--text-sm); color: var(--color-text-muted); margin-bottom: var(--space-xl); }
  .subtitle a { color: var(--color-primary); font-weight: 500; }

  .warning {
    background: rgba(253,203,110,0.1); border-left: 3px solid var(--color-warning);
    padding: var(--space-md); border-radius: var(--radius-md); font-size: var(--text-sm); margin-bottom: var(--space-lg);
  }
  .warning a { color: var(--color-primary); font-weight: 500; }

  .bag-card {
    display: flex; align-items: center; gap: var(--space-md);
    padding: var(--space-md) var(--space-lg); background: var(--color-surface);
    border-radius: var(--radius-lg); margin-bottom: var(--space-sm); box-shadow: var(--elevation-sm);
  }
  .bag-card.depleted { opacity: 0.5; }
  .bag-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .bag-info { flex: 1; }
  .bag-info strong { display: block; font-size: var(--text-sm); }
  .bag-info span { font-size: var(--text-xs); color: var(--color-text-muted); }

  .remaining { margin-top: var(--space-xs); }
  .remaining-value { font-size: var(--text-sm); font-weight: 600; color: var(--color-text-primary); }
  .remaining-bar-bg {
    display: block; height: 4px; width: 100%; background: var(--color-border);
    border-radius: 2px; margin-top: var(--space-2xs); overflow: hidden;
  }
  .remaining-bar {
    display: block; height: 100%; background: var(--color-success);
    border-radius: 2px; transition: width 0.3s;
  }
  .consumption { display: block; margin-top: 2px; }

  .btn-action {
    padding: var(--space-xs) var(--space-md);
    border: 1.5px solid var(--color-border); border-radius: var(--radius-full);
    font-size: var(--text-xs); background: var(--color-surface);
    cursor: pointer; font-family: var(--font-default); color: var(--color-text-secondary);
  }
  .btn-action.open { border-color: var(--color-primary-light); color: var(--color-primary); background: var(--color-primary-soft); }

  .depleted-section { margin-top: var(--space-lg); }
  .depleted-section summary {
    font-size: var(--text-sm); color: var(--color-text-muted); cursor: pointer;
    margin-bottom: var(--space-sm);
  }

  .add-section {
    background: var(--color-surface); border-radius: var(--radius-xl);
    padding: var(--space-lg); margin-top: var(--space-xl); box-shadow: var(--elevation-sm);
    display: flex; flex-direction: column; gap: var(--space-sm);
  }
  .add-section h2 { margin: 0 0 var(--space-sm); }
  .select {
    width: 100%; padding: var(--space-sm) var(--space-md);
    border: 1.5px solid var(--color-border); border-radius: var(--radius-lg);
    font-size: var(--text-sm); font-family: var(--font-default); background: var(--color-surface);
  }
  .row { display: flex; align-items: center; gap: var(--space-sm); }
  .input {
    padding: var(--space-sm) var(--space-md);
    border: 1.5px solid var(--color-border); border-radius: var(--radius-lg);
    font-size: var(--text-sm); font-family: var(--font-default);
  }
  .input:focus { outline: none; border-color: var(--color-primary-light); }
  .input-sm { width: 80px; }
  .input-date { flex: 1; }
  .unit { font-size: var(--text-sm); color: var(--color-text-muted); font-weight: 600; }

  .btn-primary {
    padding: var(--space-md); background: var(--color-primary); color: white;
    border: none; border-radius: var(--radius-lg); font-size: var(--text-md); font-weight: 600;
    cursor: pointer; font-family: var(--font-default);
  }
  .btn-primary:disabled { opacity: 0.4; }

  .success {
    padding: var(--space-md); background: rgba(0,184,148,0.1);
    border-left: 3px solid var(--color-success); border-radius: var(--radius-md);
    font-size: var(--text-sm); color: var(--color-success); margin-top: var(--space-md);
  }
</style>
