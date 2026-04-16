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
  let bowlType = $state('');
  let bowlCapacity = $state('');

  // Serving form
  let fillBowlId: string | null = $state(null);
  let servingAmount = $state('');

  async function handleAddBowl(e: Event) {
    e.preventDefault();
    const body: Record<string, any> = {
      name: bowlName,
      location: bowlLocation,
      bowl_type: bowlType,
    };
    if (bowlCapacity) body.capacity_g = parseInt(bowlCapacity);

    const res = await fetch(`${API_URL}/bowls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const newBowl = await res.json();
      bowls = [newBowl, ...bowls];
      servingCounts = { ...servingCounts, [newBowl.id]: 0 };
      showBowlForm = false;
      bowlName = '';
      bowlLocation = '';
      bowlType = '';
      bowlCapacity = '';
    }
  }

  async function handleFill(e: Event) {
    e.preventDefault();
    if (!fillBowlId) return;

    const res = await fetch(`${API_URL}/bowls/${fillBowlId}/fill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      <input data-testid="bowl-name" type="text" placeholder="Nom" bind:value={bowlName} required />
      <input data-testid="bowl-location" type="text" placeholder="Emplacement" bind:value={bowlLocation} required />
      <select data-testid="bowl-type" bind:value={bowlType} required>
        <option value="" disabled>Type</option>
        <option value="food">Nourriture</option>
        <option value="water">Eau</option>
      </select>
      <input data-testid="bowl-capacity" type="number" placeholder="Capacité (g/ml)" bind:value={bowlCapacity} />
      <button type="submit" class="btn-submit" data-testid="bowl-submit">Créer</button>
    </form>
  {/if}

  {#if bowls.length === 0}
    <p class="empty">Aucune gamelle configurée.</p>
  {:else}
    <div class="bowl-list">
      {#each bowls as bowl}
        <div class="bowl-card">
          <div class="bowl-info">
            <strong>{bowl.name}</strong>
            <span class="bowl-meta">
              {bowl.location} · {bowl.bowl_type === 'water' ? '💧 Eau' : '🍽️ Nourriture'}
              {#if bowl.capacity_g}· {bowl.capacity_g}{bowl.bowl_type === 'water' ? 'ml' : 'g'}{/if}
            </span>
          </div>
          <div class="bowl-actions">
            <span class="serving-count" data-testid="bowl-servings-{bowl.id}">
              {servingCounts[bowl.id] || 0} remplissages
            </span>
            {#if fillBowlId === bowl.id}
              <form class="fill-form" onsubmit={handleFill}>
                <input data-testid="serving-amount" type="number" placeholder="Quantité (g)" bind:value={servingAmount} />
                <button type="submit" class="btn-fill" data-testid="serving-submit">OK</button>
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
  .bowls-page {
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

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: calc(var(--space-unit) * 3);
  }

  .section-header h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-neutral-900);
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
  }

  .btn-add:hover {
    background: var(--color-primary-dark);
  }

  .empty {
    color: var(--color-neutral-500);
    text-align: center;
    padding: calc(var(--space-unit) * 3) 0;
  }

  .bowl-form {
    display: flex;
    gap: var(--space-unit);
    flex-wrap: wrap;
    padding: calc(var(--space-unit) * 2);
    background: var(--color-neutral-50);
    border-radius: var(--radius);
    margin-bottom: calc(var(--space-unit) * 2);
  }

  .bowl-form input,
  .bowl-form select {
    padding: calc(var(--space-unit) * 1.5);
    border: 2px solid var(--color-neutral-200);
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    flex: 1;
    min-width: 100px;
  }

  .bowl-form input:focus,
  .bowl-form select:focus {
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

  .bowl-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-unit);
  }

  .bowl-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    border-radius: var(--radius);
    padding: calc(var(--space-unit) * 2);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }

  .bowl-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .bowl-meta {
    font-size: 0.75rem;
    color: var(--color-neutral-500);
  }

  .bowl-actions {
    display: flex;
    align-items: center;
    gap: var(--space-unit);
  }

  .serving-count {
    font-size: 0.7rem;
    color: var(--color-neutral-500);
  }

  .btn-fill {
    padding: calc(var(--space-unit) / 2) calc(var(--space-unit) * 1.5);
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
  }

  .btn-fill:hover {
    opacity: 0.9;
  }

  .fill-form {
    display: flex;
    gap: calc(var(--space-unit) / 2);
  }

  .fill-form input {
    width: 80px;
    padding: calc(var(--space-unit) / 2);
    border: 2px solid var(--color-neutral-200);
    border-radius: var(--radius-sm);
    font-size: 0.8rem;
  }

  .fill-form input:focus {
    outline: none;
    border-color: var(--color-primary);
  }
</style>
