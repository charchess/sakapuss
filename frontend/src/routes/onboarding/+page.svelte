<script lang="ts">
  import { getApiUrl } from '$lib/api';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let step = $state(1); // 1=health, 2=weight, 3=food
  let petId = $state('');
  let petName = $state('');
  let done = $state(false);

  // Health reminders
  let vermifuge = $state(true);
  let antipuce = $state(true);
  let vaccin = $state(true);

  // Weight
  let weight = $state('');

  // Food
  let mealsPerDay = $state(2);

  onMount(async () => {
    const res = await fetch(`${getApiUrl()}/pets`);
    if (res.ok) {
      const pets = await res.json();
      if (pets.length > 0) {
        petId = pets[pets.length - 1].id;
        petName = pets[pets.length - 1].name;
      }
    }
  });

  async function saveHealth() {
    if (!petId) { step = 2; return; }
    const reminders = [];
    if (vermifuge) reminders.push({ name: 'Vermifuge', type: 'health', frequency_days: 90 });
    if (antipuce) reminders.push({ name: 'Antipuce', type: 'health', frequency_days: 30 });
    if (vaccin) reminders.push({ name: 'Vaccin annuel', type: 'health', frequency_days: 365 });

    for (const r of reminders) {
      await fetch(`${getApiUrl()}/pets/${petId}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(r),
      });
    }
    step = 2;
  }

  async function saveWeight() {
    if (petId && weight) {
      await fetch(`${getApiUrl()}/pets/${petId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'weight', payload: { value: parseFloat(weight), unit: 'kg' } }),
      });
    }
    step = 3;
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
    <!-- Celebration -->
    <div class="celebration" data-testid="onboarding-success">
      <div class="celebration-icon">
        <svg viewBox="0 0 64 64" fill="none" stroke="var(--color-success)" stroke-width="3" stroke-linecap="round">
          <circle cx="32" cy="32" r="28"/>
          <path d="M20 32l8 8 16-16"/>
        </svg>
      </div>
      <h1>{petName} est prêt !</h1>
      <p>Les rappels sont configurés, tu peux commencer à logger.</p>
      <button class="btn-primary" onclick={goToDashboard}>Aller au dashboard</button>
    </div>
  {:else}
    <!-- Progress dots -->
    <div class="progress-dots">
      {#each [1, 2, 3] as s}
        <div class="dot" class:active={step === s} class:done={step > s}></div>
      {/each}
    </div>

    <h1>Configurer {petName}</h1>

    {#if step === 1}
      <!-- Health reminders -->
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
      <!-- Weight -->
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
      <!-- Food -->
      <div class="wizard-card food" data-testid="wizard-food">
        <div class="card-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 12a8 8 0 0016 0"/><path d="M3 12h18"/></svg>
          <h2>Alimentation</h2>
        </div>
        <p>Repas par jour ?</p>
        <div class="meal-pills">
          {#each [1, 2, 3] as n}
            <button class="meal-pill" class:active={mealsPerDay === n} onclick={() => mealsPerDay = n}>{n}</button>
          {/each}
        </div>
        <div class="actions">
          <button class="btn-skip" onclick={finish}>Passer</button>
          <button class="btn-primary" onclick={finish}>C'est parti !</button>
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
  .food .card-header svg { stroke: var(--color-cat-food); }

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

  .meal-pills { display: flex; gap: var(--space-md); margin: var(--space-lg) 0; }
  .meal-pill {
    flex: 1; padding: var(--space-md); border: 1.5px solid var(--color-border);
    border-radius: var(--radius-lg); background: var(--color-surface);
    font-size: var(--text-xl); font-weight: 600; cursor: pointer;
    text-align: center; font-family: var(--font-default);
    transition: all 0.2s;
  }
  .meal-pill.active { border-color: var(--color-primary); background: var(--color-primary-soft); color: var(--color-primary); }

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
