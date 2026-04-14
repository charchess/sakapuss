<script lang="ts">
  import { getApiUrl } from '$lib/api';
  import { onMount } from 'svelte';

  interface LitterBox {
    id?: string;
    name: string;
    color: string;
    enabled?: boolean;
  }

  const colors = ['#6C5CE7', '#00CEC9', '#E17055', '#FDCB6E', '#A29BFE', '#00B894'];

  let boxes = $state<LitterBox[]>([]);
  let enabled = $state(true);
  let weighMode = $state<'per_box' | 'global' | 'none'>('none'); // global setting
  let saved = $state(false);

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
    // Load ALL litter resources (including disabled) so we can restore them
    const res = await fetch(`${getApiUrl()}/resources?type=litter&include_disabled=true`);
    if (res.ok) {
      const existing = await res.json();
      boxes = existing.map((r: any) => ({
        id: r.id,
        name: r.name,
        color: r.color || colors[0],
        enabled: r.enabled !== false,
      }));
      enabled = boxes.some(b => b.enabled);
      // Weigh mode is global — read from first resource
      const firstMode = existing[0]?.tracking_mode;
      if (firstMode === 'weight') weighMode = 'per_box';
      else if (firstMode === 'global_weight') weighMode = 'global';
      else weighMode = 'none';
    }
  });

  function addBox() {
    const nextColor = colors[boxes.length % colors.length];
    boxes = [...boxes, { name: '', color: nextColor }];
  }

  async function removeBox(i: number) {
    const box = boxes[i];
    if (box.id) {
      await fetch(`${getApiUrl()}/resources/${box.id}`, { method: 'DELETE', headers: authHeaders() });
    }
    boxes = boxes.filter((_, idx) => idx !== i);
  }

  async function save() {
    const trackingValue = weighMode === 'per_box' ? 'weight' : weighMode === 'global' ? 'global_weight' : 'none';

    for (const box of boxes) {
      if (!box.name.trim()) continue;

      if (box.id) {
        await fetch(`${getApiUrl()}/resources/${box.id}`, {
          method: 'PATCH',
          headers: authHeaders(),
          body: JSON.stringify({ name: box.name.trim(), color: box.color, tracking_mode: trackingValue, enabled: true }),
        });
      } else {
        const res = await fetch(`${getApiUrl()}/resources`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ name: box.name.trim(), type: 'litter', color: box.color, tracking_mode: trackingValue }),
        });
        if (res.ok) {
          const created = await res.json();
          box.id = created.id;
        }
      }
    }
    saved = true;
    setTimeout(() => saved = false, 3000);
  }

  async function toggleFeature(newEnabled: boolean) {
    enabled = newEnabled;
    for (const box of boxes) {
      if (box.id) {
        await fetch(`${getApiUrl()}/resources/${box.id}`, {
          method: 'PATCH',
          headers: authHeaders(),
          body: JSON.stringify({ enabled: newEnabled }),
        });
        box.enabled = newEnabled;
      }
    }
    if (newEnabled && boxes.length === 0) {
      addBox();
    }
  }
</script>

<svelte:head><title>Caisses — Sakapuss</title></svelte:head>

<div class="config-page">
  <a href="/settings" class="back">← Paramètres</a>
  <h1>Configuration des caisses</h1>

  <div class="enable-row">
    <span>Suivi des litières</span>
    <label class="switch">
      <input type="checkbox" bind:checked={enabled} onchange={() => toggleFeature(enabled)} />
      <span class="slider"></span>
    </label>
  </div>

  {#if enabled}
    <!-- Global weigh mode -->
    <div class="weigh-config">
      <span class="weigh-label">Pesée des déjections</span>
      <div class="weigh-pills">
        <button class="pill" class:active={weighMode === 'per_box'} onclick={() => weighMode = 'per_box'}>Par caisse</button>
        <button class="pill" class:active={weighMode === 'global'} onclick={() => weighMode = 'global'}>Globale</button>
        <button class="pill" class:active={weighMode === 'none'} onclick={() => weighMode = 'none'}>Désactivée</button>
      </div>
    </div>

    {#each boxes as box, i}
      <div class="box-card">
        <div class="box-header">
          <div class="color-dot" style="background: {box.color}"></div>
          <input type="text" bind:value={box.name} placeholder="Nom de la caisse" class="box-name" />
          <button class="btn-remove" onclick={() => removeBox(i)}>×</button>
        </div>

        <div class="box-options">
          <div class="color-picker">
            {#each colors as c}
              <button
                class="swatch"
                class:active={box.color === c}
                style="background: {c}"
                onclick={() => box.color = c}
              ></button>
            {/each}
          </div>
        </div>
      </div>
    {/each}

    <button class="btn-add" onclick={addBox}>+ Ajouter une caisse</button>

    {#if saved}
      <div class="success">Sauvegardé !</div>
    {/if}

    <button class="btn-primary" onclick={save}>Enregistrer</button>
  {:else}
    <p class="disabled-msg">Le suivi des litières est désactivé. Active-le pour configurer tes caisses.</p>
  {/if}
</div>

<style>
  .config-page { max-width: 500px; margin: 0 auto; padding: 52px var(--space-lg) var(--space-lg); }
  .back { font-size: var(--text-sm); color: var(--color-primary); text-decoration: none; }
  h1 { font-family: var(--font-display); font-size: var(--text-2xl); margin: var(--space-md) 0 var(--space-xl); }

  .enable-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: var(--space-lg); background: var(--color-surface); border-radius: var(--radius-xl);
    box-shadow: var(--elevation-sm); margin-bottom: var(--space-xl); font-weight: 500;
  }

  .switch { position: relative; width: 48px; height: 26px; }
  .switch input { opacity: 0; width: 0; height: 0; }
  .slider {
    position: absolute; inset: 0; background: var(--color-border); border-radius: 13px;
    cursor: pointer; transition: 0.3s;
  }
  .slider::before {
    content: ''; position: absolute; width: 20px; height: 20px;
    left: 3px; bottom: 3px; background: white; border-radius: 50%;
    transition: 0.3s;
  }
  .switch input:checked + .slider { background: var(--color-primary); }
  .switch input:checked + .slider::before { transform: translateX(22px); }

  .weigh-config {
    background: var(--color-surface); border-radius: var(--radius-xl);
    padding: var(--space-lg); margin-bottom: var(--space-lg); box-shadow: var(--elevation-sm);
  }
  .weigh-label { display: block; font-size: var(--text-sm); font-weight: 500; color: var(--color-text-secondary); margin-bottom: var(--space-md); }
  .weigh-pills { display: flex; gap: var(--space-xs); }

  .box-card {
    background: var(--color-surface); border-radius: var(--radius-xl);
    padding: var(--space-lg); margin-bottom: var(--space-md); box-shadow: var(--elevation-sm);
  }
  .box-header { display: flex; align-items: center; gap: var(--space-sm); }
  .color-dot { width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; }
  .box-name {
    flex: 1; padding: var(--space-sm) var(--space-md); border: 1.5px solid var(--color-border);
    border-radius: var(--radius-lg); font-size: var(--text-md); font-family: var(--font-default);
  }
  .box-name:focus { outline: none; border-color: var(--color-primary-light); }
  .btn-remove {
    width: 32px; height: 32px; border-radius: 50%; border: none;
    background: rgba(225,112,85,0.1); color: var(--color-error); font-size: 16px; cursor: pointer;
  }

  .box-options { margin-top: var(--space-md); padding-left: 36px; }

  .color-picker { display: flex; gap: var(--space-xs); margin-bottom: var(--space-md); }
  .swatch {
    width: 26px; height: 26px; border-radius: 50%; border: 2.5px solid transparent;
    cursor: pointer; transition: all 0.15s;
  }
  .swatch.active { border-color: var(--color-text-primary); transform: scale(1.15); }

  .pill {
    padding: var(--space-xs) var(--space-md); border: 1.5px solid var(--color-border);
    border-radius: var(--radius-full); font-size: var(--text-xs); background: var(--color-surface);
    cursor: pointer; font-family: var(--font-default); transition: all 0.15s;
  }
  .pill.active { border-color: var(--color-primary); background: var(--color-primary-soft); color: var(--color-primary); font-weight: 600; }

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

  .disabled-msg { color: var(--color-text-muted); text-align: center; padding: var(--space-xl) 0; }
</style>
