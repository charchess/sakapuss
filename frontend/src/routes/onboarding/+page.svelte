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

  const totalSteps = 3;

  // Step 1 — Health reminders
  let vermifuge = $state(true);
  let antipuce = $state(true);
  let vaccin = $state(true);

  // Step 2 — Weight
  let weight = $state('');

  // Step 3 — Food / alimentation
  let mealsPerDay = $state(2);

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
    const res = await fetch(`${getApiUrl()}/pets`, { headers: authHeaders() });
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

  // Step 3 — Save food preferences and finish
  async function saveFood() {
    // Could store meals_per_day preference in the future
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

    <h1>Configurer {petName || 'ton animal'}</h1>

    {#if step === 1}
      <!-- HEALTH REMINDERS -->
      <div class="wizard-card health" data-testid="wizard-health">
        <div class="card-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M9 12h6M12 9v6"/></svg>
          <h2>Rappels santé</h2>
        </div>
        <p class="speech">"{petName ? petName + ', tu' : 'Tu'} veux qu'on s'occupe de mes rappels ?"</p>

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
      <!-- ALIMENTATION -->
      <div class="wizard-card food" data-testid="wizard-food">
        <div class="card-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 12a8 8 0 0016 0"/><path d="M3 12h18"/></svg>
          <h2>Alimentation</h2>
        </div>
        <p class="speech">"{petName ? petName + ', combien' : 'Combien'} de fois par jour est-ce que je mange ?"</p>

        <div class="meals-section">
          <span class="meals-label">Repas par jour</span>
          <div class="meals-pills">
            {#each [1, 2, 3, 4] as n}
              <button
                class="meal-pill"
                class:active={mealsPerDay === n}
                onclick={() => mealsPerDay = n}
              >{n}</button>
            {/each}
          </div>
        </div>

        <div class="actions">
          <button class="btn-skip" onclick={finish}>Passer</button>
          <button class="btn-primary" onclick={saveFood}>C'est parti !</button>
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

  .meals-section { margin: var(--space-lg) 0; }
  .meals-label { display: block; font-size: var(--text-sm); font-weight: 600; color: var(--color-text-secondary); margin-bottom: var(--space-sm); }
  .meals-pills { display: flex; gap: var(--space-sm); }
  .meal-pill {
    flex: 1; padding: var(--space-md); border: 1.5px solid var(--color-border);
    border-radius: var(--radius-lg); font-size: var(--text-lg); font-weight: 600;
    background: var(--color-surface); color: var(--color-text-secondary);
    cursor: pointer; font-family: var(--font-default); transition: all 0.15s;
    text-align: center;
  }
  .meal-pill.active { border-color: var(--color-primary); background: var(--color-primary-soft); color: var(--color-primary); }
  .meal-pill:hover { border-color: var(--color-primary-light); }

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
