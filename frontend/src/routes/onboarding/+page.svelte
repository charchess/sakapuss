<script lang="ts">
  import { getApiUrl } from '$lib/api';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  const startStep = $derived(parseInt($page.url.searchParams.get('step') || '1') || 1);
  let step = $state(1);
  let petId = $state('');
  let petName = $state('');
  let done = $state(false);

  const totalSteps = 5;

  // Step 1 — Health reminders
  let vermifuge = $state(true);
  let antipuce = $state(true);
  let vaccin = $state(true);

  // Step 2 — Weight
  let weight = $state('');

  // Step 3 — Bowls (gamelles)
  let bowls = $state([{ name: '', type: 'food' as 'food' | 'water' }]);

  // Step 4 — Litter boxes (caisses)
  const litterColors = ['#6C5CE7', '#00CEC9', '#E17055', '#FDCB6E', '#A29BFE', '#00B894'];
  let litterBoxes = $state([{ name: '', color: '#6C5CE7', tracking_mode: 'weight' as string }]);

  // Step 5 — Food stock
  let foodName = $state('');
  let foodBrand = $state('');
  let bagWeight = $state('');

  function getToken(): string | null {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  }

  function authHeaders(): Record<string, string> {
    const token = getToken();
    return token
      ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      : { 'Content-Type': 'application/json' };
  }

  onMount(async () => {
    step = startStep;
    const res = await fetch(`${getApiUrl()}/pets`);
    if (res.ok) {
      const pets = await res.json();
      if (pets.length > 0) {
        petId = pets[pets.length - 1].id;
        petName = pets[pets.length - 1].name;
      }
    }
  });

  // Step 1 — Save health reminders
  async function saveHealth() {
    if (!petId) { step = 2; return; }
    const reminders = [];
    if (vermifuge) reminders.push({ name: 'Vermifuge', type: 'health', frequency_days: 90 });
    if (antipuce) reminders.push({ name: 'Antipuce', type: 'health', frequency_days: 30 });
    if (vaccin) reminders.push({ name: 'Vaccin annuel', type: 'health', frequency_days: 365 });

    for (const r of reminders) {
      await fetch(`${getApiUrl()}/pets/${petId}/reminders`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(r),
      });
    }
    step = 2;
  }

  // Step 2 — Save weight
  async function saveWeight() {
    if (petId && weight) {
      await fetch(`${getApiUrl()}/pets/${petId}/events`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ type: 'weight', payload: { value: parseFloat(weight), unit: 'kg' } }),
      });
    }
    step = 3;
  }

  // Step 3 — Save bowls
  function addBowl() {
    bowls = [...bowls, { name: '', type: 'food' }];
  }
  function removeBowl(i: number) {
    bowls = bowls.filter((_, idx) => idx !== i);
  }

  async function saveBowls() {
    for (const b of bowls) {
      if (!b.name.trim()) continue;
      await fetch(`${getApiUrl()}/bowls`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          name: b.name.trim(),
          bowl_type: b.type,
          capacity_g: b.type === 'water' ? 500 : 200,
          location: '',
        }),
      });
    }
    step = 4;
  }

  // Step 4 — Save litter boxes
  function addLitterBox() {
    const nextColor = litterColors[litterBoxes.length % litterColors.length];
    litterBoxes = [...litterBoxes, { name: '', color: nextColor, tracking_mode: 'weight' }];
  }
  function removeLitterBox(i: number) {
    litterBoxes = litterBoxes.filter((_, idx) => idx !== i);
  }

  async function saveLitterBoxes() {
    for (const lb of litterBoxes) {
      if (!lb.name.trim()) continue;
      await fetch(`${getApiUrl()}/resources`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          name: lb.name.trim(),
          type: 'litter',
          color: lb.color,
          tracking_mode: lb.tracking_mode,
        }),
      });
    }
    step = 5;
  }

  // Step 5 — Save food stock
  async function saveFoodStock() {
    if (foodName.trim()) {
      const prodRes = await fetch(`${getApiUrl()}/food/products`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          name: foodName.trim(),
          brand: foodBrand.trim() || null,
          food_type: 'kibble',
          food_category: 'main',
          default_bag_weight_g: bagWeight ? parseFloat(bagWeight) * 1000 : null,
        }),
      });
      if (prodRes.ok && bagWeight) {
        const prod = await prodRes.json();
        await fetch(`${getApiUrl()}/food/bags`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            product_id: prod.id,
            weight_g: parseFloat(bagWeight) * 1000,
            purchased_at: new Date().toISOString(),
          }),
        });
      }
    }
    finish();
  }

  function finish() {
    done = true;
    localStorage.setItem('onboarding_done', 'true');
  }

  function goToDashboard() {
    goto('/');
  }
</script>

<svelte:head><title>Configuration — Sakapuss</title></svelte:head>

<div class="onboarding">
  {#if done}
    <div class="celebration" data-testid="onboarding-success">
      <div class="celebration-icon">
        <svg viewBox="0 0 64 64" fill="none" stroke="var(--color-success)" stroke-width="3" stroke-linecap="round">
          <circle cx="32" cy="32" r="28"/>
          <path d="M20 32l8 8 16-16"/>
        </svg>
      </div>
      <h1>{petName} est prêt !</h1>
      <p>Tout est configuré, tu peux commencer à logger.</p>
      <button class="btn-primary" onclick={goToDashboard}>Aller au dashboard</button>
    </div>
  {:else}
    <div class="progress-dots">
      {#each Array(totalSteps) as _, s}
        <div class="dot" class:active={step === s + 1} class:done={step > s + 1}></div>
      {/each}
    </div>

    <h1>Configurer {petName}</h1>

    {#if step === 1}
      <!-- HEALTH REMINDERS -->
      <div class="wizard-card health" data-testid="wizard-health">
        <div class="card-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="9" width="14" height="6" rx="3" transform="rotate(-30 12 12)"/></svg>
          <h2>Rappels santé</h2>
        </div>
        <p class="speech">"{petName}, tu veux qu'on s'occupe de mes rappels ?"</p>

        <label class="toggle-row">
          <span>Vermifuge (tous les 3 mois)</span>
          <input type="checkbox" bind:checked={vermifuge} />
        </label>
        <label class="toggle-row">
          <span>Antipuce (tous les mois)</span>
          <input type="checkbox" bind:checked={antipuce} />
        </label>
        <label class="toggle-row">
          <span>Vaccin annuel</span>
          <input type="checkbox" bind:checked={vaccin} />
        </label>

        <div class="actions">
          <button class="btn-skip" onclick={() => step = 2}>Passer</button>
          <button class="btn-primary" onclick={saveHealth}>Continuer</button>
        </div>
      </div>

    {:else if step === 2}
      <!-- WEIGHT -->
      <div class="wizard-card weight" data-testid="wizard-weight">
        <div class="card-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="8" width="16" height="12" rx="3"/><circle cx="12" cy="14" r="3.5"/></svg>
          <h2>Poids actuel</h2>
        </div>
        <div class="weight-input">
          <input type="number" step="0.1" bind:value={weight} placeholder="0.0" data-testid="weight-input" />
          <span class="unit">kg</span>
        </div>
        <div class="actions">
          <button class="btn-skip" onclick={() => step = 3}>Passer</button>
          <button class="btn-primary" onclick={saveWeight}>Continuer</button>
        </div>
      </div>

    {:else if step === 3}
      <!-- BOWLS (GAMELLES) -->
      <div class="wizard-card food" data-testid="wizard-bowls">
        <div class="card-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 12a8 8 0 0016 0"/><path d="M3 12h18"/></svg>
          <h2>Gamelles</h2>
        </div>
        <p class="speech">"Où est-ce que je mange ?"</p>

        {#each bowls as bowl, i}
          <div class="resource-row">
            <input
              type="text"
              bind:value={bowl.name}
              placeholder="Ex: Gamelle cuisine"
              class="resource-input"
            />
            <select bind:value={bowl.type} class="type-select">
              <option value="food">Nourriture</option>
              <option value="water">Eau</option>
            </select>
            {#if bowls.length > 1}
              <button class="btn-remove" onclick={() => removeBowl(i)}>×</button>
            {/if}
          </div>
        {/each}

        <button class="btn-add" onclick={addBowl}>+ Ajouter une gamelle</button>

        <div class="actions">
          <button class="btn-skip" onclick={() => step = 4}>Passer</button>
          <button class="btn-primary" onclick={saveBowls}>Continuer</button>
        </div>
      </div>

    {:else if step === 4}
      <!-- LITTER BOXES (CAISSES) -->
      <div class="wizard-card litter" data-testid="wizard-litter">
        <div class="card-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M12 3v5M8 5l1.5 3M16 5l-1.5 3"/>
            <path d="M7 10h10l-1.5 8a2 2 0 01-2 1.5h-3a2 2 0 01-2-1.5L7 10z"/>
          </svg>
          <h2>Caisses</h2>
        </div>
        <p class="speech">"Et mes toilettes, elles sont où ?"</p>

        {#each litterBoxes as lb, i}
          <div class="litter-row">
            <div class="litter-main">
              <div class="color-dot" style="background: {lb.color}"></div>
              <input
                type="text"
                bind:value={lb.name}
                placeholder="Ex: Caisse salon"
                class="resource-input"
              />
              {#if litterBoxes.length > 1}
                <button class="btn-remove" onclick={() => removeLitterBox(i)}>×</button>
              {/if}
            </div>
            <div class="litter-options">
              <div class="color-picker">
                {#each litterColors as c}
                  <button
                    class="color-swatch"
                    class:active={lb.color === c}
                    style="background: {c}"
                    onclick={() => lb.color = c}
                  ></button>
                {/each}
              </div>
              <div class="tracking-toggle">
                <span class="tracking-label">Suivi :</span>
                <button class="track-opt" class:active={lb.tracking_mode === 'weight'} onclick={() => lb.tracking_mode = 'weight'}>Poids</button>
                <button class="track-opt" class:active={lb.tracking_mode === 'volume'} onclick={() => lb.tracking_mode = 'volume'}>Volume</button>
                <button class="track-opt" class:active={lb.tracking_mode === 'none'} onclick={() => lb.tracking_mode = 'none'}>Aucun</button>
              </div>
            </div>
          </div>
        {/each}

        <button class="btn-add" onclick={addLitterBox}>+ Ajouter une caisse</button>

        <div class="actions">
          <button class="btn-skip" onclick={() => step = 5}>Passer</button>
          <button class="btn-primary" onclick={saveLitterBoxes}>Continuer</button>
        </div>
      </div>

    {:else if step === 5}
      <!-- FOOD STOCK -->
      <div class="wizard-card food-stock" data-testid="wizard-food-stock">
        <div class="card-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <rect x="3" y="5" width="18" height="16" rx="2"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <h2>Stock de nourriture</h2>
        </div>
        <p class="speech">"Et je mange quoi en ce moment ?"</p>

        <div class="field">
          <label>Nom du produit</label>
          <input type="text" bind:value={foodName} placeholder="Ex: Royal Canin Indoor" class="resource-input" />
        </div>
        <div class="field">
          <label>Marque</label>
          <input type="text" bind:value={foodBrand} placeholder="Ex: Royal Canin" class="resource-input" />
        </div>
        <div class="field">
          <label>Poids du sac (kg)</label>
          <div class="weight-input-sm">
            <input type="number" step="0.1" bind:value={bagWeight} placeholder="0.0" class="resource-input" />
            <span class="unit-sm">kg</span>
          </div>
        </div>

        <div class="actions">
          <button class="btn-skip" onclick={finish}>Passer</button>
          <button class="btn-primary" onclick={saveFoodStock}>C'est parti !</button>
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .onboarding { max-width: 450px; margin: 0 auto; padding: 52px var(--space-lg); }
  h1 { font-family: var(--font-display); font-size: var(--text-2xl); text-align: center; margin-bottom: var(--space-xl); }

  .progress-dots { display: flex; justify-content: center; gap: var(--space-sm); margin-bottom: var(--space-xl); }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-border); transition: all 0.3s; }
  .dot.active { background: var(--color-primary); width: 24px; border-radius: 4px; }
  .dot.done { background: var(--color-success); }

  .wizard-card {
    background: var(--color-surface);
    border-radius: var(--radius-xl);
    padding: var(--space-xl);
    box-shadow: var(--elevation-sm);
  }
  .card-header { display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-md); }
  .card-header svg { width: 24px; height: 24px; }
  .card-header h2 { font-size: var(--text-lg); }
  .health .card-header svg { stroke: var(--color-cat-health); }
  .weight .card-header svg { stroke: var(--color-cat-weight); }
  .food .card-header svg, .food-stock .card-header svg { stroke: var(--color-cat-food); }
  .litter .card-header svg { stroke: var(--color-cat-litter); }

  .speech { font-style: italic; color: var(--color-text-secondary); font-size: var(--text-sm); margin-bottom: var(--space-lg); }

  .toggle-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: var(--space-md) 0; border-bottom: 1px solid var(--color-border);
    font-size: var(--text-sm); cursor: pointer;
  }
  .toggle-row:last-of-type { border-bottom: none; }
  input[type="checkbox"] { width: 20px; height: 20px; accent-color: var(--color-primary); }

  .weight-input { display: flex; align-items: center; gap: var(--space-sm); margin: var(--space-lg) 0; }
  .weight-input input {
    flex: 1; padding: var(--space-lg); border: 1.5px solid var(--color-border);
    border-radius: var(--radius-lg); font-size: var(--text-2xl); text-align: center;
    font-family: var(--font-default);
  }
  .weight-input input:focus { outline: none; border-color: var(--color-primary-light); }
  .unit { font-size: var(--text-xl); color: var(--color-text-muted); font-weight: 600; }

  /* Resource rows (bowls, litter) */
  .resource-row {
    display: flex; gap: var(--space-sm); margin-bottom: var(--space-sm); align-items: center;
  }
  .resource-input {
    flex: 1; padding: var(--space-md); border: 1.5px solid var(--color-border);
    border-radius: var(--radius-lg); font-size: var(--text-md); font-family: var(--font-default);
  }
  .resource-input:focus { outline: none; border-color: var(--color-primary-light); }
  .type-select {
    padding: var(--space-md); border: 1.5px solid var(--color-border);
    border-radius: var(--radius-lg); font-size: var(--text-sm); font-family: var(--font-default);
    background: var(--color-surface); color: var(--color-text-primary);
  }
  .btn-remove {
    width: 36px; height: 36px; border-radius: 50%; border: none;
    background: rgba(225,112,85,0.1); color: var(--color-error);
    font-size: 18px; cursor: pointer; flex-shrink: 0;
  }
  .btn-add {
    display: block; width: 100%; padding: var(--space-sm); margin: var(--space-md) 0;
    background: none; border: 1.5px dashed var(--color-border); border-radius: var(--radius-lg);
    color: var(--color-text-muted); font-size: var(--text-sm); cursor: pointer;
    font-family: var(--font-default);
  }
  .btn-add:hover { border-color: var(--color-primary-light); color: var(--color-primary); }

  /* Litter box config */
  .litter-row {
    background: var(--color-bg);
    border-radius: var(--radius-lg);
    padding: var(--space-md);
    margin-bottom: var(--space-sm);
  }
  .litter-main { display: flex; gap: var(--space-sm); align-items: center; }
  .color-dot { width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0; }
  .litter-options { margin-top: var(--space-sm); padding-left: 32px; }
  .color-picker { display: flex; gap: var(--space-xs); margin-bottom: var(--space-sm); }
  .color-swatch {
    width: 24px; height: 24px; border-radius: 50%; border: 2px solid transparent;
    cursor: pointer; transition: all 0.15s;
  }
  .color-swatch.active { border-color: var(--color-text-primary); transform: scale(1.15); }
  .tracking-toggle { display: flex; align-items: center; gap: var(--space-xs); }
  .tracking-label { font-size: var(--text-xs); color: var(--color-text-muted); margin-right: var(--space-xs); }
  .track-opt {
    padding: var(--space-xs) var(--space-sm); border: 1px solid var(--color-border);
    border-radius: var(--radius-full); font-size: var(--text-xs); background: var(--color-surface);
    cursor: pointer; font-family: var(--font-default); transition: all 0.15s;
  }
  .track-opt.active { border-color: var(--color-primary); background: var(--color-primary-soft); color: var(--color-primary); }

  /* Food stock fields */
  .field { margin-bottom: var(--space-md); }
  .field label { display: block; font-size: var(--text-sm); font-weight: 500; color: var(--color-text-secondary); margin-bottom: var(--space-xs); }
  .weight-input-sm { display: flex; align-items: center; gap: var(--space-sm); }
  .unit-sm { font-size: var(--text-md); color: var(--color-text-muted); font-weight: 600; }

  .actions { display: flex; gap: var(--space-md); margin-top: var(--space-xl); }
  .btn-skip { flex: 0; background: none; border: none; color: var(--color-text-muted); font-size: var(--text-sm); cursor: pointer; font-family: var(--font-default); }
  .btn-primary {
    flex: 1; padding: var(--space-md); background: var(--color-primary); color: white;
    border: none; border-radius: var(--radius-lg); font-size: var(--text-md);
    font-weight: 600; cursor: pointer; font-family: var(--font-default);
  }
  .btn-primary:active { transform: scale(0.98); }

  .celebration { text-align: center; padding: var(--space-3xl) 0; }
  .celebration-icon svg { width: 80px; height: 80px; margin-bottom: var(--space-lg); }
  .celebration h1 { color: var(--color-success); }
  .celebration p { color: var(--color-text-secondary); margin-bottom: var(--space-xl); }
  .celebration .btn-primary { max-width: 300px; margin: 0 auto; display: block; }
</style>
