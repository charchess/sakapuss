<script lang="ts">
  import { getApiUrl } from '$lib/api';
  import { onMount } from 'svelte';

  interface Product {
    id?: string;
    name: string;
    brand: string;
    food_type: string;
  }

  let products = $state<Product[]>([]);
  let saved = $state(false);

  let newName = $state('');
  let newBrand = $state('');
  let newType = $state('croquettes');

  function getToken(): string | null {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  }
  function authHeaders(): Record<string, string> {
    const token = getToken();
    return token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' };
  }

  onMount(async () => {
    const res = await fetch(`${getApiUrl()}/food/products`);
    if (res.ok) products = await res.json();
  });

  async function addProduct() {
    if (!newName.trim()) return;
    const res = await fetch(`${getApiUrl()}/food/products`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ name: newName.trim(), brand: newBrand.trim() || null, food_type: newType, food_category: 'main' }),
    });
    if (res.ok) {
      products = [...products, await res.json()];
      newName = ''; newBrand = '';
      saved = true; setTimeout(() => saved = false, 2000);
    }
  }

  async function removeProduct(id: string) {
    await fetch(`${getApiUrl()}/food/products/${id}`, { method: 'DELETE', headers: authHeaders() });
    products = products.filter(p => p.id !== id);
  }
</script>

<svelte:head><title>Produits — Sakapuss</title></svelte:head>

<div class="config-page">
  <a href="/settings" class="back">← Paramètres</a>
  <h1>Produits alimentaires</h1>
  <p class="subtitle">Les produits que tu donnes à tes animaux. Le stock est géré séparément.</p>

  {#each products as p}
    <div class="product-card">
      <div class="product-info">
        <strong>{p.name}</strong>
        <span class="meta">
          {#if p.brand}{p.brand} · {/if}{p.food_type}
        </span>
      </div>
      <button class="btn-remove" onclick={() => p.id && removeProduct(p.id)}>×</button>
    </div>
  {/each}

  <div class="add-section">
    <h2>Ajouter un produit</h2>
    <input type="text" bind:value={newName} placeholder="Nom (ex: Caille adulte)" class="input" />
    <input type="text" bind:value={newBrand} placeholder="Marque (ex: Farmina)" class="input" />
    <div class="type-row">
      {#each ['croquettes', 'pâtée', 'friandises', 'autre'] as t}
        <button class="pill" class:active={newType === t} onclick={() => newType = t}>{t}</button>
      {/each}
    </div>
    <button class="btn-primary" onclick={addProduct} disabled={!newName.trim()}>Ajouter</button>
  </div>

  {#if saved}
    <div class="success">Produit ajouté !</div>
  {/if}

  {#if products.length > 0}
    <a href="/settings/food-stock" class="stock-link">Gérer le stock (sacs) →</a>
  {/if}
</div>

<style>
  .config-page { max-width: 500px; margin: 0 auto; padding: 52px var(--space-lg) var(--space-lg); }
  .back { font-size: var(--text-sm); color: var(--color-primary); text-decoration: none; }
  h1 { font-family: var(--font-display); font-size: var(--text-2xl); margin: var(--space-md) 0 var(--space-xs); }
  h2 { font-size: var(--text-lg); margin-bottom: var(--space-md); }
  .subtitle { font-size: var(--text-sm); color: var(--color-text-muted); margin-bottom: var(--space-xl); }

  .product-card {
    display: flex; align-items: center; justify-content: space-between;
    padding: var(--space-md) var(--space-lg); background: var(--color-surface);
    border-radius: var(--radius-lg); margin-bottom: var(--space-sm); box-shadow: var(--elevation-sm);
  }
  .product-info strong { display: block; font-size: var(--text-md); }
  .meta { font-size: var(--text-xs); color: var(--color-text-muted); }
  .btn-remove {
    width: 28px; height: 28px; border-radius: 50%; border: none;
    background: rgba(225,112,85,0.1); color: var(--color-error); font-size: 14px; cursor: pointer;
  }

  .add-section {
    background: var(--color-surface); border-radius: var(--radius-xl);
    padding: var(--space-lg); margin-top: var(--space-xl); box-shadow: var(--elevation-sm);
    display: flex; flex-direction: column; gap: var(--space-sm);
  }
  .input {
    width: 100%; padding: var(--space-sm) var(--space-md);
    border: 1.5px solid var(--color-border); border-radius: var(--radius-lg);
    font-size: var(--text-sm); font-family: var(--font-default);
  }
  .input:focus { outline: none; border-color: var(--color-primary-light); }
  .type-row { display: flex; gap: var(--space-xs); flex-wrap: wrap; }
  .pill {
    padding: var(--space-xs) var(--space-md); border: 1.5px solid var(--color-border);
    border-radius: var(--radius-full); font-size: var(--text-xs); background: var(--color-surface);
    cursor: pointer; font-family: var(--font-default); transition: all 0.15s; text-transform: capitalize;
  }
  .pill.active { border-color: var(--color-primary); background: var(--color-primary-soft); color: var(--color-primary); font-weight: 600; }
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

  .stock-link {
    display: block; text-align: center; margin-top: var(--space-xl);
    color: var(--color-primary); font-weight: 500; font-size: var(--text-sm);
  }
</style>
