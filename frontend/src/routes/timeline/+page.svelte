<script lang="ts">
  import { getApiUrl } from '$lib/api';
  import { onMount } from 'svelte';

  interface TimelineEvent {
    id: string;
    pet_id: string;
    type: string;
    occurred_at: string;
    payload: any;
    created_at: string;
  }

  interface Pet {
    id: string;
    name: string;
    species: string;
  }

  let events = $state<TimelineEvent[]>([]);
  let pets = $state<Pet[]>([]);
  let activeFilter = $state('all');
  let activePet = $state('all');

  const categories = [
    { key: 'all', label: 'Tout', color: 'var(--color-text-primary)' },
    { key: 'weight', label: 'Poids', color: 'var(--color-cat-weight)' },
    { key: 'health', label: 'Santé', color: 'var(--color-cat-health)' },
    { key: 'food', label: 'Alimentation', color: 'var(--color-cat-food)' },
    { key: 'litter', label: 'Litière', color: 'var(--color-cat-litter)' },
    { key: 'behavior', label: 'Comportement', color: 'var(--color-cat-behavior)' },
  ];

  const filteredEvents = $derived(
    events.filter(e => {
      if (activeFilter !== 'all' && !e.type.includes(activeFilter)) return false;
      if (activePet !== 'all' && e.pet_id !== activePet) return false;
      return true;
    })
  );

  // Group by day
  const grouped = $derived(() => {
    const groups: Record<string, TimelineEvent[]> = {};
    for (const e of filteredEvents) {
      const day = new Date(e.occurred_at || e.created_at).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
      if (!groups[day]) groups[day] = [];
      groups[day].push(e);
    }
    return groups;
  });

  const TYPE_LABELS: Record<string, string> = {
    weight:       'Pesée',
    litter_clean: 'Litière nettoyée',
    litter:       'Litière',
    food_serve:   'Repas',
    food:         'Alimentation',
    vaccine:      'Vaccin',
    health:       'Santé',
    treatment:    'Traitement',
    medicine:     'Médicament',
    behavior:     'Comportement',
    observation:  'Observation',
    note:         'Note',
    event:        'Événement',
    relation:     'Relation',
    photo:        'Photo',
  };

  function getTypeLabel(type: string): string {
    if (TYPE_LABELS[type]) return TYPE_LABELS[type];
    // partial match fallback
    for (const [key, label] of Object.entries(TYPE_LABELS)) {
      if (type.includes(key)) return label;
    }
    return type.replace(/_/g, ' ');
  }

  function getCategoryColor(type: string): string {
    if (type.includes('weight')) return 'var(--color-cat-weight)';
    if (type.includes('litter')) return 'var(--color-cat-litter)';
    if (type.includes('food')) return 'var(--color-cat-food)';
    if (type.includes('behavior')) return 'var(--color-cat-behavior)';
    if (type.includes('vaccine') || type.includes('health') || type.includes('treatment')) return 'var(--color-cat-health)';
    return 'var(--color-cat-event)';
  }

  function getPetName(petId: string): string {
    return pets.find(p => p.id === petId)?.name || '';
  }

  function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  function authHdr(): Record<string, string> {
    const t = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    return t ? { Authorization: `Bearer ${t}` } : {};
  }

  onMount(async () => {
    const [petsRes, eventsRes] = await Promise.all([
      fetch(`${getApiUrl()}/pets`, { headers: authHdr() }),
      fetch(`${getApiUrl()}/events?limit=50`, { headers: authHdr() }),
    ]);
    if (petsRes.ok) pets = await petsRes.json();
    if (eventsRes.ok) events = await eventsRes.json();
  });
</script>

<svelte:head><title>Timeline — Sakapuss</title></svelte:head>

<div class="timeline-page">
  <h1>Timeline</h1>

  <!-- Animal filters -->
  {#if pets.length > 1}
    <div class="pet-filters">
      <button class="pet-pill" class:active={activePet === 'all'} onclick={() => activePet = 'all'}>Tous</button>
      {#each pets as pet}
        <button class="pet-pill" class:active={activePet === pet.id} onclick={() => activePet = pet.id}>{pet.name}</button>
      {/each}
    </div>
  {/if}

  <!-- Category filters -->
  <div class="category-filters" data-testid="category-filters">
    {#each categories as cat}
      <button
        class="cat-pill"
        class:active={activeFilter === cat.key}
        style="--cat-color: {cat.color}"
        onclick={() => activeFilter = cat.key}
        data-testid="filter-{cat.key}"
      >
        {cat.label}
      </button>
    {/each}
  </div>

  <!-- Timeline feed -->
  {#each Object.entries(grouped()) as [day, dayEvents]}
    <div class="day-group">
      <h2 class="day-header">{day}</h2>
      {#each dayEvents as event}
        <div class="stream-item">
          <div class="stream-dot-col">
            <div class="stream-dot" style="background: {getCategoryColor(event.type)}"></div>
            <div class="stream-line"></div>
          </div>
          <div class="stream-content">
            <div class="stream-text">
              <strong>{getPetName(event.pet_id)}</strong> · {getTypeLabel(event.type)}
              {#if event.payload?.value}
                <span class="value">{event.payload.value} {event.payload.unit || ''}</span>
              {/if}
            </div>
            {#if event.payload?.note}
              <div class="stream-note">"{event.payload.note}"</div>
            {/if}
            <div class="stream-when">{formatTime(event.occurred_at || event.created_at)}</div>
          </div>
        </div>
      {/each}
    </div>
  {/each}

  {#if filteredEvents.length === 0}
    <div class="empty">
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="40" r="36" fill="var(--color-primary-soft)"/>
        <path d="M40 20c-8 0-14 5-14 12s2 9 5 13l1 9 5-4h6l5 4 1-9c3-4 5-6 5-13s-6-12-14-12z" fill="var(--color-primary-light)" stroke="var(--color-primary)" stroke-width="1.5"/>
        <circle cx="34" cy="32" r="2" fill="var(--color-primary)"/>
        <circle cx="46" cy="32" r="2" fill="var(--color-primary)"/>
        <path d="M36 38c1 1.5 3 2 4 2s3-.5 4-2" stroke="var(--color-primary)" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <p>{activeFilter !== 'all' ? `Aucune entrée de type « ${activeFilter} »` : 'Rien ici pour l\'instant'}</p>
      <span class="empty-hint">Utilise le bouton + pour enregistrer un événement</span>
    </div>
  {/if}
</div>

<style>
  .timeline-page { padding: 52px var(--space-lg) var(--space-lg); max-width: 600px; margin: 0 auto; }
  h1 { font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 800; color: var(--color-primary); margin-bottom: var(--space-lg); }

  .pet-filters { display: flex; gap: var(--space-sm); margin-bottom: var(--space-md); overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
  .pet-filters::-webkit-scrollbar { display: none; }
  .pet-pill {
    padding: var(--space-xs) var(--space-md);
    border-radius: var(--radius-full);
    border: 1.5px solid var(--color-border);
    background: var(--color-surface);
    font-size: var(--text-sm);
    cursor: pointer;
    white-space: nowrap;
    font-family: var(--font-default);
  }
  .pet-pill.active { border-color: var(--color-primary); background: var(--color-primary-soft); color: var(--color-primary); font-weight: 600; }

  .category-filters {
    display: flex;
    gap: var(--space-sm);
    margin-bottom: var(--space-xl);
    overflow-x: auto;
    padding-bottom: var(--space-xs);
    scrollbar-width: none;
  }
  .category-filters::-webkit-scrollbar { display: none; }
  .cat-pill {
    padding: var(--space-xs) var(--space-md);
    border-radius: var(--radius-full);
    border: none;
    background: color-mix(in srgb, var(--cat-color) 10%, transparent);
    color: var(--cat-color);
    font-size: var(--text-sm);
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    font-family: var(--font-default);
    transition: all 0.2s;
  }
  .cat-pill.active {
    background: color-mix(in srgb, var(--cat-color) 20%, transparent);
    font-weight: 600;
    box-shadow: 0 2px 8px color-mix(in srgb, var(--cat-color) 20%, transparent);
  }

  .day-group { margin-bottom: var(--space-xl); }
  .day-header { font-size: var(--text-sm); font-weight: 600; color: var(--color-text-muted); text-transform: capitalize; margin-bottom: var(--space-md); }

  .stream-item { display: flex; gap: var(--space-md); padding: var(--space-sm) 0; }
  .stream-dot-col { display: flex; flex-direction: column; align-items: center; padding-top: 5px; width: 16px; }
  .stream-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .stream-line { width: 1.5px; flex: 1; margin-top: 4px; background: var(--color-border); min-height: 20px; }
  .stream-content { flex: 1; }
  .stream-text { font-size: var(--text-sm); color: var(--color-text-primary); }
  .stream-text strong { font-weight: 600; }
  .value { color: var(--color-primary); font-weight: 600; }
  .stream-note { font-size: var(--text-xs); color: var(--color-text-secondary); font-style: italic; margin-top: 2px; }
  .stream-when { font-size: var(--text-xs); color: var(--color-text-muted); margin-top: 2px; }
  .empty {
    text-align: center;
    padding: var(--space-3xl) var(--space-xl);
    color: var(--color-text-muted);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
  }
  .empty svg { width: 80px; height: 80px; }
  .empty p { font-size: var(--text-md); font-weight: 500; color: var(--color-text-secondary); }
  .empty-hint { font-size: var(--text-sm); color: var(--color-text-muted); }
</style>
