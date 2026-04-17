<script lang="ts">
  import { onMount } from 'svelte';
  import { getApiUrl } from '$lib/api';

  let { data } = $props();
  const petId = data.petId;

  interface WeightEvent {
    id: string;
    type: string;
    occurred_at: string;
    created_at: string;
    payload: { value: number; unit?: string };
  }

  let petName = $state('');
  let weightEvents = $state<WeightEvent[]>([]);

  const sorted = $derived(
    [...weightEvents].sort((a, b) =>
      new Date(a.occurred_at || a.created_at).getTime() - new Date(b.occurred_at || b.created_at).getTime()
    )
  );

  const chartData = $derived.by(() => {
    if (sorted.length < 2) return null;
    const W = 320, H = 100, pad = 28;
    const vals = sorted.map(e => e.payload.value);
    const minV = Math.min(...vals);
    const maxV = Math.max(...vals);
    const range = maxV - minV || 1;
    const points = sorted.map((e, i) => ({
      x: pad + (i / (sorted.length - 1)) * (W - 2 * pad),
      y: H - pad - ((e.payload.value - minV) / range) * (H - 2 * pad),
      value: e.payload.value,
    }));
    const path = 'M ' + points.map(p => `${p.x},${p.y}`).join(' L ');
    return { points, path };
  });

  function authHdr(): Record<string, string> {
    const t = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    return t ? { Authorization: `Bearer ${t}` } : {};
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  onMount(async () => {
    const [petRes, eventsRes] = await Promise.all([
      fetch(`${getApiUrl()}/pets/${petId}`, { headers: authHdr() }),
      fetch(`${getApiUrl()}/pets/${petId}/events?type=weight`, { headers: authHdr() }),
    ]);
    if (petRes.ok) {
      const pet = await petRes.json();
      petName = pet.name;
    }
    if (eventsRes.ok) {
      const all = await eventsRes.json();
      weightEvents = all.filter((e: WeightEvent) => e.type === 'weight' && e.payload?.value != null);
    }
  });
</script>

<svelte:head><title>Poids{petName ? ` — ${petName}` : ''} — Sakapuss</title></svelte:head>

<div class="weight-page">
  <a href="/pets/{petId}" class="back-link">← {petName || 'Retour'}</a>
  <h1>Courbe de poids</h1>

  {#if chartData}
    <div class="chart-wrap" data-testid="weight-chart">
      <svg viewBox="0 0 320 100" class="chart-svg" aria-label="Courbe de poids">
        <polyline
          fill="none"
          stroke="var(--color-cat-weight)"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          points={chartData.points.map(p => `${p.x},${p.y}`).join(' ')}
        />
        {#each chartData.points as pt}
          <circle cx={pt.x} cy={pt.y} r="4" fill="var(--color-cat-weight)" />
        {/each}
      </svg>
      <div class="chart-labels">
        <span>{sorted[0]?.payload.value} kg</span>
        <span>{sorted[sorted.length - 1]?.payload.value} kg</span>
      </div>
    </div>
  {:else if weightEvents.length === 1}
    <div class="single-weight" data-testid="weight-chart">
      <div class="single-value">{weightEvents[0].payload.value} kg</div>
      <p class="hint">Ajoutez au moins 2 pesées pour voir la courbe</p>
    </div>
  {:else}
    <div class="empty" data-testid="weight-chart-empty">
      <p>Aucune pesée enregistrée</p>
    </div>
  {/if}

  {#if sorted.length > 0}
    <section class="history">
      <h2>Historique</h2>
      {#each [...sorted].reverse() as event}
        <div class="weight-row">
          <span class="weight-val">{event.payload.value} {event.payload.unit || 'kg'}</span>
          <span class="weight-date">{formatDate(event.occurred_at || event.created_at)}</span>
        </div>
      {/each}
    </section>
  {/if}
</div>

<style>
  .weight-page { padding: 52px var(--space-lg) var(--space-xl); max-width: 500px; margin: 0 auto; }
  .back-link { display: inline-block; color: var(--color-primary); font-size: var(--text-sm); margin-bottom: var(--space-lg); }
  h1 { font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 800; color: var(--color-primary); margin-bottom: var(--space-xl); }
  h2 { font-size: var(--text-lg); margin-bottom: var(--space-md); }

  .chart-wrap { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-lg); box-shadow: var(--elevation-sm); margin-bottom: var(--space-xl); }
  .chart-svg { width: 100%; height: auto; display: block; }
  .chart-labels { display: flex; justify-content: space-between; font-size: var(--text-xs); color: var(--color-text-muted); margin-top: var(--space-xs); }

  .single-weight { text-align: center; padding: var(--space-xl); background: var(--color-surface); border-radius: var(--radius-xl); box-shadow: var(--elevation-sm); margin-bottom: var(--space-xl); }
  .single-value { font-size: var(--text-3xl); font-weight: 800; color: var(--color-cat-weight); font-family: var(--font-display); }
  .hint { font-size: var(--text-sm); color: var(--color-text-muted); margin-top: var(--space-sm); }

  .empty { text-align: center; padding: var(--space-xl); color: var(--color-text-muted); }

  .history { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-lg); box-shadow: var(--elevation-sm); }
  .weight-row { display: flex; justify-content: space-between; align-items: center; padding: var(--space-sm) 0; border-bottom: 1px solid var(--color-border); font-size: var(--text-sm); }
  .weight-row:last-child { border-bottom: none; }
  .weight-val { font-weight: 700; color: var(--color-cat-weight); }
  .weight-date { color: var(--color-text-muted); }
</style>
