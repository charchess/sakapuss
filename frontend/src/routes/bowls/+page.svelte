<script lang="ts">
  let { data } = $props();

  import { getApiUrl } from '$lib/api';

  const API_URL = getApiUrl();

  let bowls = $state(data.bowls);
  let servingCounts = $state(data.servingCounts);

  // Bowl creation form
  let showBowlForm = $state(false);
  let bowlName = $state('');
  let bowlLocation = $state('');
  let bowlType = $state('food');
  let bowlCapacity = $state('');

  // Serving form
  let fillBowlId: string | null = $state(null);
  let servingAmount = $state('');

  function getToken(): string | null {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  }

  function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
    const t = getToken();
    return { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}), ...extra };
  }

  async function handleAddBowl(e: Event) {
    e.preventDefault();
    const body: Record<string, unknown> = {
      name: bowlName,
      location: bowlLocation,
      bowl_type: bowlType,
    };
    if (bowlCapacity) body.capacity_g = parseInt(bowlCapacity);

    const res = await fetch(`${API_URL}/bowls`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const newBowl = await res.json();
      bowls = [newBowl, ...bowls];
      servingCounts = { ...servingCounts, [newBowl.id]: 0 };
      showBowlForm = false;
      bowlName = '';
      bowlLocation = '';
      bowlType = 'food';
      bowlCapacity = '';
    }
  }

  async function handleFill(e: Event) {
    e.preventDefault();
    if (!fillBowlId) return;

    const res = await fetch(`${API_URL}/bowls/${fillBowlId}/fill`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        served_at: new Date().toISOString(),
        amount_g: servingAmount ? parseInt(servingAmount) : null,
      }),
    });

    if (res.ok) {
      servingCounts = {
        ...servingCounts,
        [fillBowlId]: (servingCounts[fillBowlId] || 0) + 1,
      };
      fillBowlId = null;
      servingAmount = '';
    }
  }
</script>

<svelte:head>
  <title>Gamelles — Sakapuss</title>
</svelte:head>

<section class="bowls-page">
  <a href="/" class="back-link">← Dashboard</a>

  <div class="section-header">
    <h1>Gamelles</h1>
    <button class="btn-add" data-testid="add-bowl-btn" onclick={() => { showBowlForm = !showBowlForm; }}>
      + Gamelle
    </button>
  </div>

  {#if showBowlForm}
    <form class="bowl-form" onsubmit={handleAddBowl}>
      <div class="form-row">
        <input data-testid="bowl-name" type="text" placeholder="Nom (ex : Salon gauche)" bind:value={bowlName} required />
        <input data-testid="bowl-location" type="text" placeholder="Emplacement" bind:value={bowlLocation} required />
      </div>
      <div class="form-row">
        <div class="type-toggle">
          <button type="button" class="type-btn" class:active={bowlType === 'food'} onclick={() => bowlType = 'food'}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 12a8 8 0 0016 0"/><path d="M3 12h18"/></svg>
            Nourriture
          </button>
          <button type="button" class="type-btn" class:active={bowlType === 'water'} onclick={() => bowlType = 'water'}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2c-4 6-6 9-6 12a6 6 0 0012 0c0-3-2-6-6-12z"/></svg>
            Eau
          </button>
        </div>
        <input data-testid="bowl-capacity" type="number" placeholder="Capacité (g/ml)" bind:value={bowlCapacity} class="capacity-input" />
        <select data-testid="bowl-type" bind:value={bowlType} class="hidden-select">
          <option value="food">Nourriture</option>
          <option value="water">Eau</option>
        </select>
      </div>
      <button type="submit" class="btn-submit" data-testid="bowl-submit">Créer la gamelle</button>
    </form>
  {/if}

  {#if bowls.length === 0}
    <div class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="36" fill="var(--color-primary-soft)"/>
          <path d="M20 44a20 20 0 0040 0" stroke="var(--color-primary)" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M18 44h44" stroke="var(--color-primary)" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M28 36c0-6.6 5.4-12 12-12s12 5.4 12 12" stroke="var(--color-primary-light)" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <p class="empty-title">Aucune gamelle configurée</p>
      <span class="empty-hint">Ajoute tes gamelles pour suivre les remplissages quotidiens</span>
    </div>
  {:else}
    <div class="bowl-list">
      {#each bowls as bowl}
        <div class="bowl-card">
          <div class="bowl-icon" class:water={bowl.bowl_type === 'water'}>
            {#if bowl.bowl_type === 'water'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2c-4 6-6 9-6 12a6 6 0 0012 0c0-3-2-6-6-12z"/></svg>
            {:else}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 12a8 8 0 0016 0"/><path d="M3 12h18"/></svg>
            {/if}
          </div>
          <div class="bowl-info">
            <strong class="bowl-name">{bowl.name}</strong>
            <span class="bowl-meta">
              {bowl.location}
              {#if bowl.capacity_g}· {bowl.capacity_g}{bowl.bowl_type === 'water' ? ' ml' : ' g'}{/if}
            </span>
          </div>
          <div class="bowl-actions">
            <span class="serving-count" data-testid="bowl-servings-{bowl.id}">
              {servingCounts[bowl.id] || 0} remplissages
            </span>
            {#if fillBowlId === bowl.id}
              <form class="fill-form" onsubmit={handleFill}>
                <input data-testid="serving-amount" type="number" placeholder="g" bind:value={servingAmount} />
                <button type="submit" class="btn-fill-sm" data-testid="serving-submit">✓</button>
              </form>
            {:else}
              <button class="btn-fill" data-testid="fill-bowl-{bowl.id}" onclick={() => { fillBowlId = bowl.id; }}>
                Remplir
              </button>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</section>

<style>
  .bowls-page { max-width: 600px; padding: 52px var(--space-lg) var(--space-lg); }

  .back-link {
    display: inline-block; color: var(--color-primary);
    font-size: var(--text-sm); margin-bottom: var(--space-xl);
  }
  .back-link:hover { text-decoration: underline; }

  .section-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: var(--space-xl);
  }
  .section-header h1 {
    font-family: var(--font-display); font-size: var(--text-2xl);
    font-weight: 800; color: var(--color-primary);
  }

  .btn-add {
    padding: var(--space-sm) var(--space-lg); background: var(--color-primary);
    color: white; border: none; border-radius: var(--radius-lg);
    font-weight: 600; font-size: var(--text-sm); cursor: pointer;
    font-family: var(--font-default);
  }
  .btn-add:hover { opacity: 0.9; }

  /* Creation form */
  .bowl-form {
    display: flex; flex-direction: column; gap: var(--space-md);
    background: var(--color-surface); border-radius: var(--radius-xl);
    padding: var(--space-xl); box-shadow: var(--elevation-sm);
    margin-bottom: var(--space-xl);
  }
  .form-row { display: flex; gap: var(--space-md); }
  .form-row input {
    flex: 1; padding: var(--space-md); border: 1.5px solid var(--color-border);
    border-radius: var(--radius-lg); font-size: var(--text-md);
    font-family: var(--font-default); background: var(--color-bg);
  }
  .form-row input:focus { outline: none; border-color: var(--color-primary-light); }
  .capacity-input { max-width: 160px; }
  .hidden-select { display: none; }

  .type-toggle { display: flex; gap: var(--space-sm); }
  .type-btn {
    flex: 1; display: flex; align-items: center; gap: var(--space-xs);
    padding: var(--space-sm) var(--space-md); border: 1.5px solid var(--color-border);
    border-radius: var(--radius-lg); background: var(--color-bg);
    font-size: var(--text-sm); cursor: pointer; font-family: var(--font-default);
    transition: all 0.15s;
  }
  .type-btn svg { width: 16px; height: 16px; }
  .type-btn.active {
    border-color: var(--color-primary); background: var(--color-primary-soft);
    color: var(--color-primary); font-weight: 600;
  }

  .btn-submit {
    padding: var(--space-md); background: var(--color-primary); color: white;
    border: none; border-radius: var(--radius-lg); font-weight: 600;
    font-size: var(--text-md); cursor: pointer; font-family: var(--font-default);
  }
  .btn-submit:hover { opacity: 0.9; }

  /* Empty state */
  .empty-state {
    display: flex; flex-direction: column; align-items: center;
    text-align: center; padding: var(--space-3xl) var(--space-xl); gap: var(--space-md);
  }
  .empty-icon svg { width: 80px; height: 80px; }
  .empty-title { font-size: var(--text-md); font-weight: 500; color: var(--color-text-secondary); }
  .empty-hint { font-size: var(--text-sm); color: var(--color-text-muted); max-width: 260px; }

  /* Bowl cards */
  .bowl-list { display: flex; flex-direction: column; gap: var(--space-md); }
  .bowl-card {
    display: flex; align-items: center; gap: var(--space-md);
    background: var(--color-surface); border-radius: var(--radius-xl);
    padding: var(--space-lg); box-shadow: var(--elevation-sm);
  }

  .bowl-icon {
    width: 44px; height: 44px; border-radius: var(--radius-lg);
    background: var(--color-primary-soft);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .bowl-icon svg { width: 22px; height: 22px; stroke: var(--color-primary); }
  .bowl-icon.water { background: rgba(116, 185, 255, 0.15); }
  .bowl-icon.water svg { stroke: #74b9ff; }

  .bowl-info { flex: 1; min-width: 0; }
  .bowl-name { display: block; font-size: var(--text-md); font-weight: 600; color: var(--color-text-primary); }
  .bowl-meta { font-size: var(--text-xs); color: var(--color-text-muted); }

  .bowl-actions { display: flex; align-items: center; gap: var(--space-sm); flex-shrink: 0; }
  .serving-count {
    font-size: var(--text-xs); color: var(--color-text-muted);
    background: var(--color-bg); padding: 2px var(--space-sm);
    border-radius: var(--radius-full); white-space: nowrap;
  }

  .btn-fill {
    padding: var(--space-sm) var(--space-md); background: var(--color-primary);
    color: white; border: none; border-radius: var(--radius-lg);
    font-size: var(--text-sm); font-weight: 600; cursor: pointer;
    font-family: var(--font-default); white-space: nowrap;
  }
  .btn-fill:hover { opacity: 0.9; }

  .fill-form { display: flex; gap: var(--space-xs); align-items: center; }
  .fill-form input {
    width: 72px; padding: var(--space-sm); border: 1.5px solid var(--color-border);
    border-radius: var(--radius-lg); font-size: var(--text-sm);
    font-family: var(--font-default); text-align: center;
  }
  .fill-form input:focus { outline: none; border-color: var(--color-primary-light); }
  .btn-fill-sm {
    width: 36px; height: 36px; background: var(--color-primary); color: white;
    border: none; border-radius: var(--radius-lg); font-size: var(--text-md);
    cursor: pointer; font-family: var(--font-default);
  }
</style>
