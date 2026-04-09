<script lang="ts">
  let { data } = $props();
  import { getApiUrl } from '$lib/api';

  const API_URL = getApiUrl();

  const EVENT_ICONS: Record<string, string> = {
    weight: '⚖️',
    note: '📝',
    vaccine: '💉',
    treatment: '💊',
    litter: '🪣',
    food: '🍽️',
  };

  const EVENT_LABELS: Record<string, string> = {
    weight: 'Poids',
    note: 'Note',
    vaccine: 'Vaccin',
    treatment: 'Traitement',
    litter: 'Litière',
    food: 'Alimentation',
  };

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatShortDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  }

  function summarizePayload(type: string, payload: Record<string, any>): string {
    switch (type) {
      case 'weight':
        return `${payload.value} ${payload.unit || 'kg'}`;
      case 'note':
        return payload.text || '';
      case 'vaccine':
        return payload.name + (payload.next_due ? ` — prochain : ${payload.next_due}` : '');
      case 'treatment':
        return payload.name || payload.text || JSON.stringify(payload);
      case 'litter':
        return payload.status || payload.text || 'Nettoyage';
      case 'food':
        return payload.brand || payload.text || 'Repas';
      case 'relation':
        return payload.text || `${payload.verb?.replace('_', ' ')} ${payload.object_pet_id || ''}`;
      default:
        return JSON.stringify(payload);
    }
  }

  // Weight chart data
  const weightEvents = data.events
    .filter((e: any) => e.type === 'weight')
    .sort((a: any, b: any) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime());

  const hasEnoughWeight = weightEvents.length >= 2;
  const hasAnyWeight = weightEvents.length > 0;

  // Chart dimensions
  const chartWidth = 560;
  const chartHeight = 200;
  const padding = { top: 20, right: 50, bottom: 30, left: 50 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Compute chart scales
  function getChartData() {
    if (!hasEnoughWeight) return { points: [], pathD: '', yTicks: [], xLabels: [] };

    const values = weightEvents.map((e: any) => e.payload.value as number);
    const times = weightEvents.map((e: any) => new Date(e.occurred_at).getTime());

    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const valRange = maxVal - minVal || 1;
    const yPad = valRange * 0.15;
    const yMin = minVal - yPad;
    const yMax = maxVal + yPad;

    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const timeRange = maxTime - minTime || 1;

    const points = weightEvents.map((e: any, i: number) => {
      const x = padding.left + ((times[i] - minTime) / timeRange) * plotWidth;
      const y = padding.top + plotHeight - ((values[i] - yMin) / (yMax - yMin)) * plotHeight;
      return { x, y, value: values[i], date: e.occurred_at };
    });

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    // Y-axis ticks
    const yTicks = [yMin, (yMin + yMax) / 2, yMax].map(v => ({
      value: Math.round(v * 10) / 10,
      y: padding.top + plotHeight - ((v - yMin) / (yMax - yMin)) * plotHeight,
    }));

    // X-axis labels (first and last)
    const xLabels = [
      { label: formatShortDate(weightEvents[0].occurred_at), x: points[0].x },
      { label: formatShortDate(weightEvents[weightEvents.length - 1].occurred_at), x: points[points.length - 1].x },
    ];

    return { points, pathD, yTicks, xLabels };
  }

  const chart = getChartData();

  // Fast Action state
  let activeAction: string | null = $state(null);
  let selectedOptions: string[] = $state([]);
  let weightInputValue: string = $state('');
  let events = $state(data.events);

  // Photo gallery: events with photo_url in payload
  let photoEvents = $derived(events.filter((e: any) => e.payload.photo_url));

  const TREE_OPTIONS: Record<string, Array<{id: string, label: string, icon: string}>> = {
    litter: [
      { id: 'normal', label: 'Normal', icon: '✅' },
      { id: 'blood', label: 'Sang', icon: '🩸' },
      { id: 'diarrhea', label: 'Diarrhée', icon: '💧' },
    ],
    food: [
      { id: 'normal-appetite', label: 'Appétit normal', icon: '✅' },
      { id: 'low-appetite', label: 'Peu d\'appétit', icon: '📉' },
      { id: 'vomiting', label: 'Vomissement', icon: '🤢' },
    ],
    health: [
      { id: 'normal', label: 'Tout va bien', icon: '✅' },
      { id: 'lethargy', label: 'Léthargie', icon: '😴' },
      { id: 'scratching', label: 'Grattage', icon: '🐾' },
    ],
  };

  function openAction(action: string) {
    activeAction = action;
    selectedOptions = [];
    weightInputValue = '';
  }

  function toggleOption(optionId: string) {
    if (selectedOptions.includes(optionId)) {
      selectedOptions = selectedOptions.filter(o => o !== optionId);
    } else {
      selectedOptions = [...selectedOptions, optionId];
    }
  }

  async function saveLog() {
    if (!activeAction) return;

    let eventType = activeAction;
    let payload: Record<string, any> = {};

    if (activeAction === 'weight') {
      const val = parseFloat(weightInputValue);
      if (isNaN(val)) { activeAction = null; return; }
      payload = { value: val, unit: 'kg' };
    } else if (selectedOptions.length === 0) {
      // RAS (All Clear)
      payload = { status: 'RAS', text: 'Rien à signaler' };
    } else {
      payload = { anomalies: selectedOptions };
    }

    const res = await fetch(`${API_URL}/pets/${data.pet.id}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: eventType,
        occurred_at: new Date().toISOString(),
        payload,
      }),
    });

    if (res.ok) {
      const newEvent = await res.json();
      events = [newEvent, ...events];
    }

    activeAction = null;
  }
  // Free-form event state
  let showEventForm = $state(false);
  let eventType = $state('');
  let eventDate = $state('');
  let eventPayloadName = $state('');
  let eventPayloadText = $state('');
  let eventRelationVerb = $state('');
  let eventRelationObject = $state('');

  const EVENT_TYPES = ['weight', 'note', 'vaccine', 'treatment', 'litter', 'food', 'relation'];
  const RELATION_VERBS = ['plays_with', 'fights_with', 'sleeps_with', 'grooms', 'avoids'];

  // Other pets for relation events
  let otherPets = $derived(
    (data.allPets || []).filter((p: any) => p.id !== data.pet.id)
  );

  async function submitEvent(e: Event) {
    e.preventDefault();

    let payload: Record<string, any> = {};

    if (eventType === 'weight') {
      payload = { value: parseFloat(eventPayloadName), unit: 'kg' };
    } else if (eventType === 'vaccine' || eventType === 'treatment') {
      payload = { name: eventPayloadName };
      if (eventPayloadText) payload.text = eventPayloadText;
    } else if (eventType === 'note') {
      payload = { text: eventPayloadText };
    } else if (eventType === 'relation') {
      payload = {
        subject_pet_id: data.pet.id,
        verb: eventRelationVerb,
        object_pet_id: eventRelationObject,
        text: eventPayloadText,
      };
    } else {
      payload = { text: eventPayloadText || eventPayloadName };
    }

    const res = await fetch(`${API_URL}/pets/${data.pet.id}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: eventType,
        occurred_at: new Date(eventDate).toISOString(),
        payload,
      }),
    });

    if (res.ok) {
      const newEvent = await res.json();
      events = [newEvent, ...events];

      // If relation, also create on the other pet's timeline
      if (eventType === 'relation' && eventRelationObject) {
        await fetch(`${API_URL}/pets/${eventRelationObject}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'relation',
            occurred_at: new Date(eventDate).toISOString(),
            payload,
          }),
        });
      }
    }

    showEventForm = false;
    eventType = '';
    eventDate = '';
    eventPayloadName = '';
    eventPayloadText = '';
    eventRelationVerb = '';
    eventRelationObject = '';
  }
</script>

<svelte:head>
  <title>{data.pet.name} — Sakapuss</title>
</svelte:head>

<section class="pet-profile">
  <a href="/" class="back-link">← Retour au dashboard</a>

  <div class="profile-header">
    {#if data.pet.photo_url}
      <img src={data.pet.photo_url} alt={data.pet.name} class="profile-photo" />
    {:else}
      <div class="profile-photo-placeholder">🐾</div>
    {/if}

    <div class="profile-details">
      <h1>{data.pet.name}</h1>
      <span class="species">{data.pet.species}</span>
      <span class="birth-date">Né(e) le {data.pet.birth_date}</span>
      <div class="profile-actions">
        <a href="/pets/{data.pet.id}/edit" class="profile-action-link" data-testid="edit-link">Modifier</a>
        <a href="/pets/{data.pet.id}/vet" class="profile-action-link" data-testid="vet-link">Résumé véto</a>
      </div>
    </div>
  </div>

  <!-- Pet Switcher -->
  {#if data.allPets && data.allPets.length > 1}
    <nav class="pet-switcher" data-testid="pet-switcher">
      {#each data.allPets as p}
        <a
          href="/pets/{p.id}"
          class="switcher-item {p.id === data.pet.id ? 'active' : ''}"
        >
          {p.name}
        </a>
      {/each}
    </nav>
  {/if}

  <!-- Fast Action Grid -->
  <div class="fast-action-grid" data-testid="fast-action-grid">
    <button class="action-btn" data-testid="fast-action-litter" onclick={() => openAction('litter')}>
      <span class="action-icon">🪣</span>
      <span class="action-label">Litière</span>
    </button>
    <button class="action-btn" data-testid="fast-action-food" onclick={() => openAction('food')}>
      <span class="action-icon">🍽️</span>
      <span class="action-label">Repas</span>
    </button>
    <button class="action-btn" data-testid="fast-action-weight" onclick={() => openAction('weight')}>
      <span class="action-icon">⚖️</span>
      <span class="action-label">Poids</span>
    </button>
    <button class="action-btn" data-testid="fast-action-health" onclick={() => openAction('health')}>
      <span class="action-icon">📈</span>
      <span class="action-label">Santé</span>
    </button>
  </div>

  <!-- Free-form Event Button & Form -->
  <div class="event-form-section">
    <button class="btn-add-event" data-testid="add-event-btn" onclick={() => { showEventForm = !showEventForm; }}>
      + Ajouter un événement
    </button>

    {#if showEventForm}
      <form class="event-form" data-testid="event-form" onsubmit={submitEvent}>
        <select data-testid="event-type" bind:value={eventType} required>
          <option value="" disabled>Type d'événement</option>
          {#each EVENT_TYPES as t}
            <option value={t}>{EVENT_LABELS[t] || t}</option>
          {/each}
        </select>

        <input data-testid="event-date" type="datetime-local" bind:value={eventDate} required />

        {#if eventType === 'vaccine' || eventType === 'treatment'}
          <input data-testid="event-payload-name" type="text" placeholder="Nom (ex: Rage, Frontline)" bind:value={eventPayloadName} required />
        {/if}

        {#if eventType === 'weight'}
          <input data-testid="event-payload-name" type="number" step="0.1" placeholder="Poids (kg)" bind:value={eventPayloadName} required />
        {/if}

        {#if eventType === 'relation'}
          <select data-testid="event-relation-verb" bind:value={eventRelationVerb} required>
            <option value="" disabled>Action</option>
            {#each RELATION_VERBS as v}
              <option value={v}>{v.replace('_', ' ')}</option>
            {/each}
          </select>
          <select data-testid="event-relation-object" bind:value={eventRelationObject} required>
            <option value="" disabled>Avec quel animal</option>
            {#each otherPets as op}
              <option value={op.id}>{op.name}</option>
            {/each}
          </select>
        {/if}

        {#if eventType === 'note' || eventType === 'relation' || eventType === 'vaccine' || eventType === 'treatment'}
          <textarea data-testid="event-payload-text" placeholder="Notes" bind:value={eventPayloadText}></textarea>
        {/if}

        <button type="submit" class="btn-event-submit" data-testid="event-submit">Créer</button>
      </form>
    {/if}
  </div>

  <!-- Correlation Insights -->
  {#if data.correlations && data.correlations.length > 0}
    <div class="correlation-insight" data-testid="correlation-insight">
      <h3>Corrélation détectée</h3>
      {#each data.correlations as correl}
        <div class="insight-card">
          <span class="insight-icon">⚠️</span>
          <div class="insight-text">
            <p>
              Changement alimentaire ({correl.trigger_event.payload.brand || 'nourriture'})
              suivi de symptômes digestifs après <strong>{correl.delay_hours}h</strong>
            </p>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Weight Chart -->
  {#if hasEnoughWeight}
    <div class="weight-chart-section" data-testid="weight-chart">
      <h2>Suivi du poids</h2>
      <div class="chart-container">
        <svg viewBox="0 0 {chartWidth} {chartHeight}" class="weight-svg">
          <!-- Grid lines -->
          {#each chart.yTicks as tick}
            <line
              x1={padding.left}
              y1={tick.y}
              x2={chartWidth - padding.right}
              y2={tick.y}
              class="grid-line"
            />
            <text x={padding.left - 8} y={tick.y + 4} class="axis-label y-label">
              {tick.value}
            </text>
          {/each}

          <!-- Line path -->
          <path d={chart.pathD} class="weight-line" fill="none" />

          <!-- Data points with labels -->
          {#each chart.points as point}
            <circle cx={point.x} cy={point.y} r="4" class="weight-point" />
            <text x={point.x} y={point.y - 10} class="point-label">
              {point.value}
            </text>
          {/each}

          <!-- X-axis labels -->
          {#each chart.xLabels as label}
            <text x={label.x} y={chartHeight - 4} class="axis-label x-label">
              {label.label}
            </text>
          {/each}
        </svg>
      </div>
    </div>
  {:else if hasAnyWeight}
    <div class="weight-chart-insufficient" data-testid="weight-chart-insufficient">
      <h2>Suivi du poids</h2>
      <p>Au moins 2 pesées sont nécessaires pour afficher le graphique.</p>
    </div>
  {/if}

  <!-- Photo Gallery -->
  {#if photoEvents.length > 0}
    <div class="photo-gallery-section" data-testid="photo-gallery">
      <h2>Galerie photos</h2>
      <div class="photo-grid">
        {#each photoEvents as pe}
          <a href={`#event-${pe.id}`} class="photo-thumb">
            <img src={pe.payload.photo_url} alt={summarizePayload(pe.type, pe.payload)} />
            <span class="photo-date">{formatShortDate(pe.occurred_at)}</span>
          </a>
        {/each}
      </div>
    </div>
  {/if}

  <div class="timeline-section" data-testid="pet-timeline">
    <h2>Historique de santé</h2>

    {#if events.length === 0}
      <div class="timeline-empty" data-testid="timeline-empty">
        <p>Aucun événement enregistré pour le moment.</p>
      </div>
    {:else}
      <div class="timeline-feed">
        {#each events as event}
          <div class="timeline-event" data-testid="timeline-event">
            <div class="event-icon" data-testid="event-icon">
              {EVENT_ICONS[event.type] || '📋'}
            </div>
            <div class="event-content">
              <div class="event-header">
                <span class="event-type" data-testid="event-type">
                  {EVENT_LABELS[event.type] || event.type}
                </span>
                <span class="event-date" data-testid="event-date">
                  {formatDate(event.occurred_at)}
                </span>
              </div>
              <p class="event-summary">
                {summarizePayload(event.type, event.payload)}
              </p>
              {#if event.payload.tags?.length}
                <div class="tag-badges">
                  {#each event.payload.tags as tag}
                    <span class="tag-badge">{tag}</span>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</section>

<!-- Decision Tree Modal -->
{#if activeAction}
  <div class="modal-overlay" data-testid="decision-tree">
    <div class="modal-content">
      <h3>{EVENT_LABELS[activeAction] || activeAction}</h3>

      {#if activeAction === 'weight'}
        <div class="weight-input-section">
          <label for="weight-val">Poids (kg)</label>
          <input
            id="weight-val"
            type="number"
            step="0.1"
            data-testid="weight-input"
            bind:value={weightInputValue}
            placeholder="ex: 4.5"
          />
        </div>
      {:else if TREE_OPTIONS[activeAction]}
        <div class="tree-options">
          {#each TREE_OPTIONS[activeAction] as option}
            <button
              class="tree-option {selectedOptions.includes(option.id) ? 'selected' : ''}"
              data-testid="tree-option-{option.id}"
              onclick={() => toggleOption(option.id)}
            >
              <span class="option-icon">{option.icon}</span>
              <span class="option-label">{option.label}</span>
            </button>
          {/each}
        </div>
      {/if}

      <div class="modal-actions">
        <button class="btn-save" data-testid="save-log-btn" onclick={saveLog}>
          Enregistrer
        </button>
        <button class="btn-cancel" onclick={() => { activeAction = null; }}>
          Annuler
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .pet-profile {
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

  .profile-header {
    display: flex;
    gap: calc(var(--space-unit) * 3);
    align-items: flex-start;
    background: white;
    border-radius: var(--radius);
    padding: calc(var(--space-unit) * 3);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }

  .profile-photo {
    width: 120px;
    height: 120px;
    border-radius: var(--radius-sm);
    object-fit: cover;
  }

  .profile-photo-placeholder {
    width: 120px;
    height: 120px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-neutral-100);
    font-size: 3rem;
  }

  .profile-details h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: calc(var(--space-unit) / 2);
  }

  .species {
    display: block;
    color: var(--color-primary);
    font-size: 1rem;
    font-weight: 500;
  }

  .birth-date {
    display: block;
    color: var(--color-neutral-500);
    font-size: 0.875rem;
    margin-top: calc(var(--space-unit) / 2);
  }

  /* Weight Chart */
  .weight-chart-section,
  .weight-chart-insufficient {
    margin-top: calc(var(--space-unit) * 4);
  }

  .weight-chart-section h2,
  .weight-chart-insufficient h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: calc(var(--space-unit) * 2);
    color: var(--color-neutral-700);
  }

  .weight-chart-insufficient p {
    background: white;
    border-radius: var(--radius);
    padding: calc(var(--space-unit) * 3);
    text-align: center;
    color: var(--color-neutral-500);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }

  .chart-container {
    background: white;
    border-radius: var(--radius);
    padding: calc(var(--space-unit) * 2);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }

  .weight-svg {
    width: 100%;
    height: auto;
  }

  .grid-line {
    stroke: var(--color-neutral-200);
    stroke-width: 1;
    stroke-dasharray: 4 4;
  }

  .weight-line {
    stroke: var(--color-accent);
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .weight-point {
    fill: var(--color-accent);
  }

  .point-label {
    font-size: 11px;
    fill: var(--color-neutral-700);
    text-anchor: middle;
    font-weight: 600;
  }

  .axis-label {
    font-size: 10px;
    fill: var(--color-neutral-500);
  }

  .y-label {
    text-anchor: end;
  }

  .x-label {
    text-anchor: middle;
  }

  /* Timeline */
  .timeline-section {
    margin-top: calc(var(--space-unit) * 4);
  }

  .timeline-section h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: calc(var(--space-unit) * 2);
    color: var(--color-neutral-700);
  }

  .timeline-empty {
    background: white;
    border-radius: var(--radius);
    padding: calc(var(--space-unit) * 4);
    text-align: center;
    color: var(--color-neutral-500);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }

  .timeline-feed {
    display: flex;
    flex-direction: column;
    gap: calc(var(--space-unit) * 1.5);
  }

  .timeline-event {
    display: flex;
    gap: calc(var(--space-unit) * 2);
    background: white;
    border-radius: var(--radius);
    padding: calc(var(--space-unit) * 2);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    align-items: flex-start;
  }

  .event-icon {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    background: var(--color-neutral-100);
    border-radius: var(--radius-sm);
  }

  .event-content {
    flex: 1;
    min-width: 0;
  }

  .event-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--space-unit);
    margin-bottom: calc(var(--space-unit) / 2);
  }

  .event-type {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--color-primary);
  }

  .event-date {
    font-size: 0.75rem;
    color: var(--color-neutral-500);
    white-space: nowrap;
  }

  .event-summary {
    font-size: 0.875rem;
    color: var(--color-neutral-700);
    line-height: 1.5;
  }

  /* Fast Action Grid */
  .fast-action-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: calc(var(--space-unit) * 1.5);
    margin-top: calc(var(--space-unit) * 3);
  }

  @media (max-width: 600px) {
    .fast-action-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: calc(var(--space-unit) / 2);
    padding: calc(var(--space-unit) * 2);
    min-height: 44px;
    background: white;
    border: 2px solid var(--color-neutral-200);
    border-radius: var(--radius);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .action-btn:hover {
    border-color: var(--color-primary);
    background: var(--color-neutral-50);
  }

  .action-icon {
    font-size: 1.5rem;
  }

  .action-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-neutral-700);
  }

  /* Decision Tree Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }

  .modal-content {
    background: white;
    border-radius: var(--radius);
    padding: calc(var(--space-unit) * 3);
    width: min(400px, 90vw);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  }

  .modal-content h3 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: calc(var(--space-unit) * 2);
    color: var(--color-neutral-900);
  }

  .tree-options {
    display: flex;
    flex-direction: column;
    gap: var(--space-unit);
    margin-bottom: calc(var(--space-unit) * 2);
  }

  .tree-option {
    display: flex;
    align-items: center;
    gap: calc(var(--space-unit) * 1.5);
    padding: calc(var(--space-unit) * 1.5);
    background: var(--color-neutral-50);
    border: 2px solid var(--color-neutral-200);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .tree-option:hover {
    border-color: var(--color-primary-light);
  }

  .tree-option.selected {
    border-color: var(--color-accent);
    background: #ECFDF5;
  }

  .option-icon {
    font-size: 1.25rem;
  }

  .option-label {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .weight-input-section {
    margin-bottom: calc(var(--space-unit) * 2);
  }

  .weight-input-section label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: var(--space-unit);
    color: var(--color-neutral-700);
  }

  .weight-input-section input {
    width: 100%;
    padding: calc(var(--space-unit) * 1.5);
    border: 2px solid var(--color-neutral-200);
    border-radius: var(--radius-sm);
    font-size: 1rem;
  }

  .weight-input-section input:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  .modal-actions {
    display: flex;
    gap: var(--space-unit);
  }

  .btn-save {
    flex: 1;
    padding: calc(var(--space-unit) * 1.5);
    background: var(--color-accent);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    font-weight: 600;
    cursor: pointer;
  }

  .btn-save:hover {
    background: #059669;
  }

  .btn-cancel {
    flex: 1;
    padding: calc(var(--space-unit) * 1.5);
    background: var(--color-neutral-100);
    color: var(--color-neutral-700);
    border: none;
    border-radius: var(--radius-sm);
    font-weight: 500;
    cursor: pointer;
  }

  .btn-cancel:hover {
    background: var(--color-neutral-200);
  }

  /* Tag Badges */
  .tag-badges {
    display: flex;
    flex-wrap: wrap;
    gap: calc(var(--space-unit) / 2);
    margin-top: calc(var(--space-unit) / 2);
  }

  .tag-badge {
    display: inline-block;
    padding: 2px 8px;
    font-size: 0.7rem;
    font-weight: 500;
    background: var(--color-neutral-100);
    color: var(--color-neutral-600, #6B7280);
    border-radius: 9999px;
    border: 1px solid var(--color-neutral-200);
  }

  /* Photo Gallery */
  .photo-gallery-section {
    margin-top: calc(var(--space-unit) * 4);
  }

  .photo-gallery-section h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: calc(var(--space-unit) * 2);
    color: var(--color-neutral-700);
  }

  .photo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: var(--space-unit);
  }

  .photo-thumb {
    position: relative;
    aspect-ratio: 1;
    border-radius: var(--radius-sm);
    overflow: hidden;
    display: block;
  }

  .photo-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .photo-date {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    font-size: 0.625rem;
    text-align: center;
    padding: 2px;
  }

  /* Correlation Insight Card */
  .correlation-insight {
    margin-top: calc(var(--space-unit) * 3);
    background: #FFF7ED;
    border: 1px solid #FDBA74;
    border-radius: var(--radius);
    padding: calc(var(--space-unit) * 2);
  }

  .correlation-insight h3 {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: var(--space-unit);
    color: #9A3412;
  }

  .insight-card {
    display: flex;
    align-items: flex-start;
    gap: var(--space-unit);
  }

  .insight-icon {
    font-size: 1.25rem;
    flex-shrink: 0;
  }

  .insight-text p {
    font-size: 0.875rem;
    color: #92400E;
    line-height: 1.5;
  }

  /* Profile Actions */
  .profile-actions {
    display: flex;
    gap: var(--space-unit);
    margin-top: calc(var(--space-unit) * 1.5);
  }

  .profile-action-link {
    display: inline-block;
    padding: calc(var(--space-unit) / 2) calc(var(--space-unit) * 1.5);
    font-size: 0.75rem;
    font-weight: 600;
    border-radius: var(--radius-sm);
    text-decoration: none;
  }

  .profile-action-link:first-child {
    background: var(--color-neutral-100);
    color: var(--color-neutral-700);
  }

  .profile-action-link:first-child:hover {
    background: var(--color-neutral-200);
  }

  .profile-action-link:last-child {
    background: #EFF6FF;
    color: #1D4ED8;
  }

  .profile-action-link:last-child:hover {
    background: #DBEAFE;
  }

  /* Pet Switcher */
  .pet-switcher {
    display: flex;
    gap: calc(var(--space-unit) / 2);
    flex-wrap: wrap;
    margin-top: calc(var(--space-unit) * 2);
    padding: calc(var(--space-unit) * 1.5);
    background: var(--color-neutral-50);
    border-radius: var(--radius);
  }

  .switcher-item {
    padding: calc(var(--space-unit) / 2) calc(var(--space-unit) * 1.5);
    font-size: 0.8rem;
    font-weight: 500;
    border-radius: var(--radius-sm);
    text-decoration: none;
    color: var(--color-neutral-600, #6B7280);
    background: white;
    border: 1px solid var(--color-neutral-200);
    transition: all 0.15s ease;
  }

  .switcher-item:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  .switcher-item.active {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
  }

  /* Free-form Event Form */
  .event-form-section {
    margin-top: calc(var(--space-unit) * 3);
  }

  .btn-add-event {
    padding: calc(var(--space-unit)) calc(var(--space-unit) * 2);
    background: var(--color-neutral-100);
    color: var(--color-neutral-700);
    border: 1px dashed var(--color-neutral-300);
    border-radius: var(--radius-sm);
    font-weight: 600;
    font-size: 0.8rem;
    cursor: pointer;
    width: 100%;
  }

  .btn-add-event:hover {
    background: var(--color-neutral-200);
  }

  .event-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-unit);
    padding: calc(var(--space-unit) * 2);
    background: var(--color-neutral-50);
    border-radius: var(--radius);
    margin-top: var(--space-unit);
  }

  .event-form select,
  .event-form input,
  .event-form textarea {
    padding: calc(var(--space-unit) * 1.5);
    border: 2px solid var(--color-neutral-200);
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    background: white;
  }

  .event-form select:focus,
  .event-form input:focus,
  .event-form textarea:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  .event-form textarea {
    min-height: 60px;
    resize: vertical;
  }

  .btn-event-submit {
    padding: calc(var(--space-unit) * 1.5);
    background: var(--color-accent);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    font-weight: 600;
    cursor: pointer;
  }

  .btn-event-submit:hover {
    background: #059669;
  }

</style>
