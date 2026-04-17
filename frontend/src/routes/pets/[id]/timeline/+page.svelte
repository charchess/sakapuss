<script lang="ts">
  import { onMount } from 'svelte';
  import { getApiUrl } from '$lib/api';

  let { data } = $props();
  const petId = data.petId;

  interface TimelineEvent {
    id: string;
    pet_id: string;
    type: string;
    occurred_at: string;
    payload: any;
    created_at: string;
  }

  let events = $state<TimelineEvent[]>([]);
  let activeFilter = $state('all');
  let petName = $state('');
  let dismissedAnomaly = $state(false);

  const weightAnomaly = $derived.by(() => {
    const weightEvts = events
      .filter(e => e.type === 'weight' && e.payload?.value != null)
      .sort((a, b) => new Date(a.occurred_at || a.created_at).getTime() - new Date(b.occurred_at || b.created_at).getTime());
    if (weightEvts.length < 2) return null;
    const first = weightEvts[0];
    const last = weightEvts[weightEvts.length - 1];
    const firstVal = parseFloat(first.payload.value);
    const lastVal = parseFloat(last.payload.value);
    if (lastVal >= firstVal) return null;
    const loss = parseFloat((firstVal - lastVal).toFixed(1));
    const daysElapsed = Math.round(
      (new Date(last.occurred_at || last.created_at).getTime() - new Date(first.occurred_at || first.created_at).getTime())
      / (1000 * 60 * 60 * 24)
    );
    const duration = daysElapsed >= 30 ? `${Math.round(daysElapsed / 30)} mois` : `${daysElapsed} jours`;
    return { loss, duration };
  });

  const categories = [
    { key: 'all', label: 'Tout', color: null },
    { key: 'weight', label: 'Poids', color: 'var(--color-cat-weight)' },
    { key: 'health', label: 'Santé', color: 'var(--color-cat-health)' },
    { key: 'food', label: 'Alimentation', color: 'var(--color-cat-food)' },
    { key: 'litter', label: 'Litière', color: 'var(--color-cat-litter)' },
    { key: 'behavior', label: 'Comportement', color: 'var(--color-cat-behavior)' },
  ];

  const filteredEvents = $derived(
    events.filter(e => {
      if (activeFilter === 'all') return true;
      return e.type.includes(activeFilter);
    })
  );

  const grouped = $derived.by(() => {
    const groups: Record<string, TimelineEvent[]> = {};
    for (const e of filteredEvents) {
      const day = new Date(e.occurred_at || e.created_at).toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long',
      });
      if (!groups[day]) groups[day] = [];
      groups[day].push(e);
    }
    return groups;
  });

  const TYPE_LABELS: Record<string, string> = {
    weight: 'Pesée',
    litter_clean: 'Litière nettoyée',
    litter: 'Litière',
    food_serve: 'Repas',
    food: 'Alimentation',
    vaccine: 'Vaccin',
    health: 'Santé',
    treatment: 'Traitement',
    medicine: 'Médicament',
    health_note: 'Médicament',
    behavior: 'Observation',
    observation: 'Observation',
    note: 'Note',
    event: 'Événement',
    custom: 'Événement',
  };

  function getTypeLabel(type: string): string {
    if (TYPE_LABELS[type]) return TYPE_LABELS[type];
    for (const [key, label] of Object.entries(TYPE_LABELS)) {
      if (type.includes(key)) return label;
    }
    return type.replace(/_/g, ' ');
  }

  function getCategoryColor(type: string): string {
    if (type.includes('weight')) return 'var(--color-cat-weight)';
    if (type.includes('litter')) return 'var(--color-cat-litter)';
    if (type.includes('food')) return 'var(--color-cat-food)';
    if (type.includes('behavior') || type.includes('observation')) return 'var(--color-cat-behavior)';
    if (type.includes('vaccine') || type.includes('health') || type.includes('treatment') || type.includes('medicine')) return 'var(--color-cat-health)';
    return 'var(--color-cat-event)';
  }

  function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  function authHdr(): Record<string, string> {
    const t = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    return t ? { Authorization: `Bearer ${t}` } : {};
  }

  onMount(async () => {
    const [petRes, eventsRes] = await Promise.all([
      fetch(`${getApiUrl()}/pets/${petId}`, { headers: authHdr() }),
      fetch(`${getApiUrl()}/pets/${petId}/events`, { headers: authHdr() }),
    ]);
    if (petRes.ok) {
      const pet = await petRes.json();
      petName = pet.name;
    }
    if (eventsRes.ok) events = await eventsRes.json();
  });
</script>

<svelte:head><title>Historique{petName ? ` — ${petName}` : ''} — Sakapuss</title></svelte:head>

<div class="timeline-page">
  <a href="/pets/{petId}" class="back-link">← {petName || 'Retour'}</a>
  <h1>Historique</h1>

  {#if weightAnomaly && !dismissedAnomaly}
    <div class="anomaly-banner" data-testid="anomaly-banner">
      <a href="/pets/{petId}/weight" class="anomaly-text">
        {petName} a perdu {weightAnomaly.loss} kg en {weightAnomaly.duration}
      </a>
      <button class="anomaly-close" onclick={() => dismissedAnomaly = true}>Fermer</button>
    </div>
  {/if}

  <!-- Category filter pills -->
  <div class="category-filter-row" data-testid="category-filter-row">
    {#each categories as cat}
      <button
        class="cat-pill"
        class:active={activeFilter === cat.key}
        aria-pressed={activeFilter === cat.key}
        data-category={cat.key !== 'all' ? cat.key : null}
        style={cat.color ? `--cat-color: ${cat.color}` : null}
        onclick={() => activeFilter = cat.key}
      >
        {cat.label}
      </button>
    {/each}
  </div>

  <!-- Timeline feed -->
  {#each Object.entries(grouped) as [day, dayEvents]}
    <div class="day-group">
      <h2 class="day-header">{day}</h2>
      {#each dayEvents as event}
        <div class="timeline-event stream-item" data-testid="timeline-event">
          <div class="stream-dot-col">
            <div class="stream-dot" style="background: {getCategoryColor(event.type)}"></div>
            <div class="stream-line"></div>
          </div>
          <div class="stream-content">
            <div class="stream-text">
              <strong>{getTypeLabel(event.type)}</strong>
              {#if event.payload?.value != null}
                <span class="value">{event.payload.value}{event.payload.unit ? ` ${event.payload.unit}` : ''}</span>
              {/if}
              {#if event.payload?.name}
                <span class="value">{event.payload.name}</span>
              {/if}
            </div>
            {#if event.payload?.note}
              <div class="stream-note">"{event.payload.note}"</div>
            {/if}
            {#if event.payload?.tags?.length}
              <div class="stream-tags">
                {#each event.payload.tags as tag}
                  <span class="tag">{tag}</span>
                {/each}
              </div>
            {/if}
            <div class="stream-when">{formatTime(event.occurred_at || event.created_at)}</div>
          </div>
        </div>
      {/each}
    </div>
  {/each}

  {#if filteredEvents.length === 0}
    <div class="empty">
      <p>{activeFilter !== 'all' ? `Aucune entrée dans cette catégorie` : 'Aucun événement enregistré'}</p>
    </div>
  {/if}
</div>

<style>
  .timeline-page { padding: 52px var(--space-lg) var(--space-lg); max-width: 600px; }

  .back-link {
    display: inline-block; color: var(--color-primary);
    font-size: var(--text-sm); margin-bottom: var(--space-lg);
  }
  .back-link:hover { text-decoration: underline; }

  h1 {
    font-family: var(--font-display); font-size: var(--text-2xl);
    font-weight: 800; color: var(--color-primary); margin-bottom: var(--space-lg);
  }

  .category-filter-row {
    display: flex; gap: var(--space-sm);
    margin-bottom: var(--space-xl); overflow-x: auto;
    padding-bottom: var(--space-xs);
  }

  .cat-pill {
    padding: var(--space-xs) var(--space-md);
    border-radius: var(--radius-full); border: none;
    background: color-mix(in srgb, var(--cat-color, var(--color-text-muted)) 10%, transparent);
    color: var(--cat-color, var(--color-text-muted));
    font-size: var(--text-sm); font-weight: 500;
    cursor: pointer; white-space: nowrap;
    font-family: var(--font-default); transition: all 0.2s;
  }
  .cat-pill[data-category='all'],
  .cat-pill:not([data-category]) {
    background: var(--color-primary-soft);
    color: var(--color-text-secondary);
  }
  .cat-pill.active {
    background: color-mix(in srgb, var(--cat-color, var(--color-primary)) 20%, transparent);
    font-weight: 600;
    box-shadow: 0 2px 8px color-mix(in srgb, var(--cat-color, var(--color-primary)) 20%, transparent);
  }
  .cat-pill:not([data-category]).active {
    background: var(--color-primary-soft);
    color: var(--color-primary); font-weight: 600;
  }

  .day-group { margin-bottom: var(--space-xl); }
  .day-header {
    font-size: var(--text-sm); font-weight: 600; color: var(--color-text-muted);
    text-transform: capitalize; margin-bottom: var(--space-md);
  }

  .stream-item { display: flex; gap: var(--space-md); padding: var(--space-sm) 0; }
  .stream-dot-col { display: flex; flex-direction: column; align-items: center; padding-top: 5px; width: 16px; }
  .stream-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .stream-line { width: 1.5px; flex: 1; margin-top: 4px; background: var(--color-border); min-height: 20px; }
  .stream-content { flex: 1; }
  .stream-text { font-size: var(--text-sm); color: var(--color-text-primary); }
  .stream-text strong { font-weight: 600; }
  .value { color: var(--color-primary); font-weight: 600; margin-left: var(--space-xs); }
  .stream-note { font-size: var(--text-xs); color: var(--color-text-secondary); font-style: italic; margin-top: 2px; }
  .stream-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
  .tag {
    font-size: 11px; padding: 2px 8px;
    background: var(--color-primary-soft); color: var(--color-primary);
    border-radius: var(--radius-full);
  }
  .stream-when { font-size: var(--text-xs); color: var(--color-text-muted); margin-top: 2px; }

  .empty {
    text-align: center; padding: var(--space-3xl) var(--space-xl);
    color: var(--color-text-muted); font-size: var(--text-md);
  }

  .anomaly-banner {
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(225, 112, 85, 0.08);
    border: 1.5px solid var(--color-error);
    border-radius: var(--radius-lg);
    padding: var(--space-md) var(--space-lg);
    margin-bottom: var(--space-lg);
    gap: var(--space-md);
  }
  .anomaly-text {
    flex: 1; font-size: var(--text-sm); font-weight: 600;
    color: var(--color-error); text-decoration: none;
  }
  .anomaly-text:hover { text-decoration: underline; }
  .anomaly-close {
    background: none; border: none; color: var(--color-error);
    font-size: var(--text-sm); cursor: pointer; font-family: var(--font-default);
    padding: 0; flex-shrink: 0;
  }
</style>
