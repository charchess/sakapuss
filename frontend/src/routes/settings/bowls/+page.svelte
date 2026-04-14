<script lang="ts">
  import { getApiUrl } from '$lib/api';
  import { onMount } from 'svelte';

  interface Bowl {
    id?: string;
    name: string;
    location: string;
    capacity_g: number;
    bowl_type: string;
    current_product_id: string | null;
    fill_mode: string; // 'flat' (forfaitaire = capacity) or 'precise'
  }

  interface Product { id: string; name: string; brand: string | null; }

  const locationColors: Record<string, string> = {};
  const colorPool = ['#6C5CE7', '#00CEC9', '#E17055', '#FDCB6E', '#A29BFE', '#00B894'];

  let bowls = $state<Bowl[]>([]);
  let products = $state<Product[]>([]);
  let saved = $state(false);

  function getToken(): string | null {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  }
  function authHeaders(): Record<string, string> {
    const token = getToken();
    return token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' };
  }

  onMount(async () => {
    const [bRes, pRes] = await Promise.all([
      fetch(`${getApiUrl()}/bowls`),
      fetch(`${getApiUrl()}/food/products`),
    ]);
    if (bRes.ok) {
      const existing = await bRes.json();
      bowls = existing.map((b: any) => ({
        ...b,
        fill_mode: b.fill_mode || 'flat',
      }));
    }
    if (pRes.ok) products = await pRes.json();
  });

  function addBowl() {
    bowls = [...bowls, {
      name: '',
      location: '',
      capacity_g: 30,
      bowl_type: 'food',
      current_product_id: products[0]?.id || null,
      fill_mode: 'flat',
    }];
  }

  async function removeBowl(i: number) {
    const bowl = bowls[i];
    if (bowl.id) {
      await fetch(`${getApiUrl()}/bowls/${bowl.id}`, { method: 'DELETE', headers: authHeaders() });
    }
    bowls = bowls.filter((_, idx) => idx !== i);
  }

  async function save() {
    for (const bowl of bowls) {
      if (!bowl.name.trim()) continue;

      const payload = {
        name: bowl.name.trim(),
        location: bowl.location.trim(),
        capacity_g: bowl.capacity_g,
        bowl_type: bowl.bowl_type,
        current_product_id: bowl.current_product_id || null,
      };

      if (bowl.id) {
        await fetch(`${getApiUrl()}/bowls/${bowl.id}`, {
          method: 'PUT', headers: authHeaders(), body: JSON.stringify(payload),
        });
      } else {
        const res = await fetch(`${getApiUrl()}/bowls`, {
          method: 'POST', headers: authHeaders(), body: JSON.stringify(payload),
        });
        if (res.ok) {
          const created = await res.json();
          bowl.id = created.id;
        }
      }
    }
    saved = true;
    setTimeout(() => saved = false, 3000);
  }

  function getLocationColor(loc: string): string {
    if (!loc) return '#636E72';
    if (!locationColors[loc]) {
      locationColors[loc] = colorPool[Object.keys(locationColors).length % colorPool.length];
    }
    return locationColors[loc];
  }

  // Group bowls by location for display
  const locations = $derived(() => {
    const locs: Record<string, Bowl[]> = {};
    for (const b of bowls) {
      const loc = b.location || 'Sans emplacement';
      if (!locs[loc]) locs[loc] = [];
      locs[loc].push(b);
    }
    return locs;
  });
</script>

<svelte:head><title>Gamelles — Sakapuss</title></svelte:head>

<div class="config-page">
  <a href="/settings" class="back">← Paramètres</a>
  <h1>Configuration des gamelles</h1>

  {#if products.length === 0}
    <div class="warning">
      <p>Aucun produit configuré. <a href="/settings/food">Configure tes produits d'abord</a>.</p>
    </div>
  {/if}

  {#each bowls as bowl, i}
    <div class="bowl-card">
      <div class="bowl-header">
        <div class="loc-dot" style="background: {getLocationColor(bowl.location)}"></div>
        <input type="text" bind:value={bowl.name} placeholder="Nom (ex: Salon G)" class="input flex" />
        <button class="btn-remove" onclick={() => removeBowl(i)}>×</button>
      </div>

      <div class="bowl-fields">
        <div class="field-row">
          <label>Emplacement</label>
          <input type="text" bind:value={bowl.location} placeholder="Ex: Salon, Local technique" class="input" />
        </div>

        <div class="field-row">
          <label>Type</label>
          <div class="type-pills">
            <button class="pill" class:active={bowl.bowl_type === 'food'} onclick={() => bowl.bowl_type = 'food'}>Nourriture</button>
            <button class="pill" class:active={bowl.bowl_type === 'water'} onclick={() => bowl.bowl_type = 'water'}>Eau</button>
          </div>
        </div>

        {#if bowl.bowl_type === 'food' && products.length > 0}
          <div class="field-row">
            <label>Produit</label>
            <select bind:value={bowl.current_product_id} class="select">
              <option value={null}>— Aucun —</option>
              {#each products as p}
                <option value={p.id}>{p.name}{p.brand ? ` (${p.brand})` : ''}</option>
              {/each}
            </select>
          </div>
        {/if}

        <div class="field-row">
          <label>Quantité par défaut</label>
          <div class="capacity-row">
            <input type="number" bind:value={bowl.capacity_g} class="input input-sm" />
            <span class="unit">{bowl.bowl_type === 'water' ? 'ml' : 'g'}</span>
          </div>
        </div>
      </div>
    </div>
  {/each}

  <button class="btn-add" onclick={addBowl}>+ Ajouter une gamelle</button>

  {#if saved}
    <div class="success">Sauvegardé !</div>
  {/if}

  {#if bowls.length > 0}
    <button class="btn-primary" onclick={save}>Enregistrer</button>
  {/if}
</div>

<style>
  .config-page { max-width: 500px; margin: 0 auto; padding: 52px var(--space-lg) var(--space-lg); }
  .back { font-size: var(--text-sm); color: var(--color-primary); text-decoration: none; }
  h1 { font-family: var(--font-display); font-size: var(--text-2xl); margin: var(--space-md) 0 var(--space-xl); }

  .warning {
    background: rgba(253,203,110,0.1); border-left: 3px solid var(--color-warning);
    padding: var(--space-md); border-radius: var(--radius-md); margin-bottom: var(--space-lg);
    font-size: var(--text-sm);
  }
  .warning a { color: var(--color-primary); font-weight: 500; }

  .bowl-card {
    background: var(--color-surface); border-radius: var(--radius-xl);
    padding: var(--space-lg); margin-bottom: var(--space-md); box-shadow: var(--elevation-sm);
  }
  .bowl-header { display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-md); }
  .loc-dot { width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0; }

  .bowl-fields { display: flex; flex-direction: column; gap: var(--space-md); padding-left: 32px; }
  .field-row { }
  .field-row label { display: block; font-size: var(--text-xs); font-weight: 500; color: var(--color-text-muted); margin-bottom: var(--space-xs); }

  .input {
    width: 100%; padding: var(--space-sm) var(--space-md);
    border: 1.5px solid var(--color-border); border-radius: var(--radius-lg);
    font-size: var(--text-sm); font-family: var(--font-default);
  }
  .input:focus { outline: none; border-color: var(--color-primary-light); }
  .input.flex { flex: 1; }
  .input-sm { width: 80px; }
  .select {
    width: 100%; padding: var(--space-sm) var(--space-md);
    border: 1.5px solid var(--color-border); border-radius: var(--radius-lg);
    font-size: var(--text-sm); font-family: var(--font-default); background: var(--color-surface);
  }

  .capacity-row { display: flex; align-items: center; gap: var(--space-sm); }
  .unit { font-size: var(--text-sm); color: var(--color-text-muted); font-weight: 600; }

  .type-pills { display: flex; gap: var(--space-xs); }
  .pill {
    padding: var(--space-xs) var(--space-md); border: 1.5px solid var(--color-border);
    border-radius: var(--radius-full); font-size: var(--text-xs); background: var(--color-surface);
    cursor: pointer; font-family: var(--font-default); transition: all 0.15s;
  }
  .pill.active { border-color: var(--color-primary); background: var(--color-primary-soft); color: var(--color-primary); font-weight: 600; }

  .btn-remove {
    width: 32px; height: 32px; border-radius: 50%; border: none;
    background: rgba(225,112,85,0.1); color: var(--color-error); font-size: 16px; cursor: pointer;
  }

  .btn-add {
    display: block; width: 100%; padding: var(--space-md); margin-bottom: var(--space-xl);
    background: none; border: 1.5px dashed var(--color-border); border-radius: var(--radius-lg);
    color: var(--color-text-muted); font-size: var(--text-sm); cursor: pointer; font-family: var(--font-default);
  }
  .btn-add:hover { border-color: var(--color-primary-light); color: var(--color-primary); }

  .success {
    padding: var(--space-md); background: rgba(0,184,148,0.1);
    border-left: 3px solid var(--color-success); border-radius: var(--radius-md);
    font-size: var(--text-sm); color: var(--color-success); margin-bottom: var(--space-md);
  }

  .btn-primary {
    width: 100%; padding: var(--space-lg); background: var(--color-primary); color: white;
    border: none; border-radius: var(--radius-lg); font-size: var(--text-md); font-weight: 600;
    cursor: pointer; font-family: var(--font-default);
  }
  .btn-primary:active { transform: scale(0.98); }
</style>
