<script lang="ts">
  import { getApiUrl } from '$lib/api';

  let { data } = $props();

  // ── Event list (reactive) ──────────────────────────────────────────────
  let events = $state([...data.events]);

  // ── Inline event form ──────────────────────────────────────────────────
  let showEventForm = $state(false);
  let eventType = $state('note');
  let eventDate = $state('');
  let eventPayloadName = $state('');
  let eventPayloadText = $state('');
  let eventRelationVerb = $state('plays_with');
  let eventRelationObject = $state('');
  let eventSubmitting = $state(false);

  // ── Fast-action decision tree ──────────────────────────────────────────
  let activeTree = $state<string | null>(null);   // 'litter' | 'food' | 'weight' | 'health'
  let treeSelections = $state<string[]>([]);
  let treeWeightValue = $state('');
  let treeSaving = $state(false);

  function openTree(action: string) {
    activeTree = action;
    treeSelections = [];
    treeWeightValue = '';
  }
  function closeTree() { activeTree = null; }

  function toggleTreeOption(opt: string) {
    if (treeSelections.includes(opt)) {
      treeSelections = treeSelections.filter(o => o !== opt);
    } else {
      treeSelections = [...treeSelections, opt];
    }
  }

  async function saveTree() {
    if (!activeTree) return;
    treeSaving = true;
    const token = getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    let type = '';
    let payload: Record<string, any> = {};

    if (activeTree === 'litter') {
      type = 'litter';
      if (treeSelections.length === 0) {
        payload = { anomalies: [], ras: true, status: 'RAS' };
      } else {
        payload = { anomalies: treeSelections };
      }
    } else if (activeTree === 'food') {
      type = 'food';
      payload = { appetite: treeSelections[0] || 'normal' };
    } else if (activeTree === 'weight') {
      type = 'weight';
      payload = { value: parseFloat(treeWeightValue) || 0, unit: 'kg' };
    } else if (activeTree === 'health') {
      type = 'health_note';
      payload = { text: treeSelections[0] || 'RAS' };
    }

    try {
      const res = await fetch(`${getApiUrl()}/pets/${data.pet.id}/events`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type,
          occurred_at: new Date().toISOString(),
          payload,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        events = [created, ...events];
        closeTree();
      }
    } finally {
      treeSaving = false;
    }
  }

  // ── Weight chart (SVG) ─────────────────────────────────────────────────
  const weightEventsChron = $derived(
    events
      .filter((e: any) => e.type === 'weight' && e.payload?.value != null)
      .sort((a: any, b: any) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime())
  );

  function buildWeightChartPath(pts: any[]): string {
    if (pts.length < 2) return '';
    const W = 280, H = 80, pad = 24;
    const vals = pts.map((p: any) => parseFloat(p.payload.value));
    const minV = Math.min(...vals), maxV = Math.max(...vals);
    const range = maxV - minV || 1;
    const coords = pts.map((p: any, i: number) => {
      const x = pad + (i / (pts.length - 1)) * (W - 2 * pad);
      const y = H - pad - ((parseFloat(p.payload.value) - minV) / range) * (H - 2 * pad);
      return `${x},${y}`;
    });
    return 'M ' + coords.join(' L ');
  }

  // ── Weight chart data (coords + labels) ───────────────────────────────
  const weightChartData = $derived.by(() => {
    const pts = weightEventsChron;
    if (pts.length < 2) return null;
    const W = 280, H = 80, pad = 24;
    const vals = pts.map((p: any) => parseFloat(p.payload.value));
    const minV = Math.min(...vals), maxV = Math.max(...vals);
    const range = maxV - minV || 1;
    return {
      points: pts.map((p: any, i: number) => ({
        x: pad + (i / (pts.length - 1)) * (W - 2 * pad),
        y: H - pad - ((parseFloat(p.payload.value) - minV) / range) * (H - 2 * pad),
        value: parseFloat(p.payload.value),
      })),
      path: buildWeightChartPath(pts),
    };
  });

  // ── Photo gallery ──────────────────────────────────────────────────────
  const photoEvents = $derived(
    events.filter((e: any) => e.payload?.photo_url)
      .sort((a: any, b: any) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())
  );

  // ── Derived display lists ──────────────────────────────────────────────
  const weightEvents = $derived(
    events.filter((e: any) => e.type === 'weight' && e.payload?.value)
      .sort((a: any, b: any) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())
  );
  const latestWeight = $derived(weightEvents[0]?.payload?.value);
  const prevWeight = $derived(weightEvents[1]?.payload?.value);
  const weightTrendDir = $derived.by(() => {
    if (!latestWeight || !prevWeight) return null;
    const diff = latestWeight - prevWeight;
    if (Math.abs(diff) < 0.05) return 'stable';
    return diff > 0 ? 'up' : 'down';
  });

  const recentEvents = $derived(
    [...events].sort((a: any, b: any) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()).slice(0, 5)
  );

  // ── Helpers ────────────────────────────────────────────────────────────
  function getSpeciesEmoji(species: string): string {
    if (species?.toLowerCase().includes('cat') || species?.toLowerCase().includes('chat')) return '🐱';
    if (species?.toLowerCase().includes('dog') || species?.toLowerCase().includes('chien')) return '🐶';
    if (species?.toLowerCase().includes('rabbit') || species?.toLowerCase().includes('lapin')) return '🐰';
    return '🐾';
  }

  function getSpeciesLabel(species: string): string {
    const s = species?.toLowerCase() || '';
    if (s.includes('cat') || s.includes('chat')) return 'Chat';
    if (s.includes('dog') || s.includes('chien')) return 'Chien';
    if (s.includes('rabbit') || s.includes('lapin')) return 'Lapin';
    return species;
  }

  function getAge(birthDate: string | null): string {
    if (!birthDate) return '';
    const diff = Date.now() - new Date(birthDate).getTime();
    const years = Math.floor(diff / (365.25 * 24 * 3600 * 1000));
    if (years < 1) {
      const months = Math.floor(diff / (30.44 * 24 * 3600 * 1000));
      return `${months} mois`;
    }
    return `${years} an${years > 1 ? 's' : ''}`;
  }

  function getTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "à l'instant";
    if (hours < 24) return `il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return days === 1 ? 'hier' : `il y a ${days}j`;
  }

  function statusColor(status: string): string {
    if (status === 'overdue') return 'var(--color-error)';
    if (status === 'today') return 'var(--color-warning)';
    return 'var(--color-success)';
  }

  function getEventTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      weight: 'Poids', litter_clean: 'Litière nettoyée', litter: 'Litière', food_serve: 'Gamelle remplie',
      food: 'Alimentation', health_note: 'Médicament', behavior: 'Observation', vaccine: 'Vaccin',
      note: 'Note', custom: 'Événement', treatment: 'Traitement', relation: 'Relation',
    };
    return labels[type] ?? type.replace(/_/g, ' ');
  }

  function getToken(): string | null {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  }

  // ── Inline event form submit ───────────────────────────────────────────
  async function submitEvent() {
    if (!eventDate) return;
    eventSubmitting = true;
    const payload: Record<string, any> = {};
    if (eventType === 'vaccine' && eventPayloadName) payload.name = eventPayloadName;
    if (['note', 'behavior', 'custom', 'relation'].includes(eventType) && eventPayloadText) payload.text = eventPayloadText;
    if (eventType === 'relation') {
      payload.verb = eventRelationVerb;
      payload.object_pet_id = eventRelationObject;
      payload.subject_pet_id = data.pet.id;
    }
    const token = getToken();
    try {
      const res = await fetch(`${getApiUrl()}/pets/${data.pet.id}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          type: eventType,
          occurred_at: new Date(eventDate).toISOString(),
          payload,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        events = [created, ...events];
        showEventForm = false;
        eventPayloadName = '';
        eventPayloadText = '';
        eventDate = '';
        eventType = 'note';
        eventRelationVerb = 'plays_with';
        eventRelationObject = '';
      }
    } finally {
      eventSubmitting = false;
    }
  }
</script>

<svelte:head><title>{data.pet.name} — Sakapuss</title></svelte:head>

<div class="profile">
  <div class="hero">
    <div class="hero-avatar">
      {#if data.pet.photo_url}
        <img src={data.pet.photo_url} alt={data.pet.name} />
      {:else}
        {getSpeciesEmoji(data.pet.species)}
      {/if}
    </div>
    <div class="hero-info">
      <h1>{data.pet.name}</h1>
      <p class="hero-meta">
        {getSpeciesLabel(data.pet.species)}
        {#if data.pet.breed} · {data.pet.breed}{/if}
        {#if data.pet.birth_date} · {getAge(data.pet.birth_date)}{/if}
      </p>
      {#if data.pet.microchip}<p class="hero-chip">Puce: {data.pet.microchip}</p>{/if}
    </div>
    <a href="/pets/{data.pet.id}/edit" class="edit-btn" aria-label="Modifier" data-testid="edit-link">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
    </a>
  </div>

  {#if data.allPets?.length > 1}
    <nav class="pet-switcher" data-testid="pet-switcher" aria-label="Changer d'animal">
      {#each data.allPets as p}
        <a
          href="/pets/{p.id}"
          class="switcher-item"
          class:active={p.id === data.pet.id}
          aria-current={p.id === data.pet.id ? 'page' : undefined}
        >
          {p.name}
        </a>
      {/each}
    </nav>
  {/if}

  <div class="fast-action-grid" data-testid="fast-action-grid">
    <button class="fast-action" data-testid="fast-action-litter" onclick={() => openTree('litter')}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
      </svg>
      <span>Litière</span>
    </button>
    <button class="fast-action" data-testid="fast-action-food" onclick={() => openTree('food')}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
      </svg>
      <span>Repas</span>
    </button>
    <button class="fast-action" data-testid="fast-action-weight" onclick={() => openTree('weight')}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <rect x="4" y="8" width="16" height="12" rx="3"/><circle cx="12" cy="14" r="3.5"/>
      </svg>
      <span>Poids</span>
    </button>
    <button class="fast-action" data-testid="fast-action-health" onclick={() => openTree('health')}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M3 21l9-9"/><path d="M12.7 4.3a1 1 0 011.4 0l5.6 5.6a1 1 0 010 1.4l-7 7a1 1 0 01-1.4 0L5.7 12.7a1 1 0 010-1.4l7-7z"/>
      </svg>
      <span>Santé</span>
    </button>
    <button class="fast-action" onclick={() => { showEventForm = true; eventType = 'note'; }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/>
      </svg>
      <span>Note</span>
    </button>
    <button class="fast-action" onclick={() => { showEventForm = true; eventType = 'custom'; }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
      <span>Autre</span>
    </button>
  </div>

  {#if activeTree !== null}
    <div class="tree-overlay" onclick={closeTree} role="dialog" aria-modal="true">
      <div class="tree-modal" data-testid="decision-tree" onclick={(e) => e.stopPropagation()}>
        <button class="tree-close" onclick={closeTree} aria-label="Fermer">✕</button>

        {#if activeTree === 'litter'}
          <h3 class="tree-title">Litière</h3>
          <p class="tree-subtitle">Anomalies observées ?</p>
          <div class="tree-options">
            <button
              class="tree-option"
              class:selected={treeSelections.includes('blood')}
              data-testid="tree-option-blood"
              onclick={() => toggleTreeOption('blood')}
            >🩸 Sang</button>
            <button
              class="tree-option"
              class:selected={treeSelections.includes('diarrhea')}
              data-testid="tree-option-diarrhea"
              onclick={() => toggleTreeOption('diarrhea')}
            >💧 Diarrhée</button>
            <button
              class="tree-option"
              class:selected={treeSelections.includes('normal')}
              data-testid="tree-option-normal"
              onclick={() => toggleTreeOption('normal')}
            >✅ Normal</button>
          </div>

        {:else if activeTree === 'food'}
          <h3 class="tree-title">Repas</h3>
          <p class="tree-subtitle">Appétit ?</p>
          <div class="tree-options">
            <button
              class="tree-option"
              class:selected={treeSelections.includes('normal')}
              data-testid="tree-option-normal-appetite"
              onclick={() => toggleTreeOption('normal')}
            >😺 Appétit normal</button>
            <button
              class="tree-option"
              class:selected={treeSelections.includes('reduced')}
              onclick={() => toggleTreeOption('reduced')}
            >😐 Appétit réduit</button>
            <button
              class="tree-option"
              class:selected={treeSelections.includes('refused')}
              onclick={() => toggleTreeOption('refused')}
            >❌ A refusé</button>
          </div>

        {:else if activeTree === 'weight'}
          <h3 class="tree-title">Poids</h3>
          <p class="tree-subtitle">Poids actuel</p>
          <div class="tree-weight-input">
            <input
              type="number"
              step="0.1"
              data-testid="weight-input"
              bind:value={treeWeightValue}
              placeholder="0.0"
              class="tree-number-input"
            />
            <span class="tree-unit">kg</span>
          </div>

        {:else if activeTree === 'health'}
          <h3 class="tree-title">Santé</h3>
          <p class="tree-subtitle">Observation</p>
          <div class="tree-options">
            <button
              class="tree-option"
              class:selected={treeSelections.includes('RAS')}
              onclick={() => toggleTreeOption('RAS')}
            >✅ RAS</button>
            <button
              class="tree-option"
              class:selected={treeSelections.includes('Médicament donné')}
              onclick={() => toggleTreeOption('Médicament donné')}
            >💊 Médicament</button>
            <button
              class="tree-option"
              class:selected={treeSelections.includes('Vomissement')}
              onclick={() => toggleTreeOption('Vomissement')}
            >🤢 Vomissement</button>
          </div>
        {/if}

        <button
          class="tree-save-btn"
          data-testid="save-log-btn"
          onclick={saveTree}
          disabled={treeSaving}
        >{treeSaving ? 'Sauvegarde...' : 'Enregistrer'}</button>
      </div>
    </div>
  {/if}

  {#if data.anomalies?.length > 0}
    {#each data.anomalies as anomaly}
      <div class="alert-card">
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" stroke-width="2" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <span>{anomaly.description}</span>
      </div>
    {/each}
  {/if}

  {#if data.correlations?.length > 0}
    <section class="section correlation-card" data-testid="correlation-insight">
      <div class="section-header">
        <h2>Corrélation détectée</h2>
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" stroke-width="2" stroke-linecap="round" class="corr-icon"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
      </div>
      {#each data.correlations as corr}
        <p class="correlation-text">{corr.description ?? corr.insight ?? corr.text ?? 'Corrélation détectée'}</p>
      {/each}
    </section>
  {/if}

  {#if weightEventsChron.length > 0}
    <section class="section">
      <div class="section-header">
        <h2>Poids</h2>
        {#if latestWeight}
          <span class="weight-badge">
            {latestWeight} kg
            {#if weightTrendDir === 'up'}↑{:else if weightTrendDir === 'down'}↓{:else if weightTrendDir === 'stable'}→{/if}
          </span>
        {/if}
      </div>

      {#if weightChartData}
        <div data-testid="weight-chart" class="weight-chart-wrap">
          <svg viewBox="0 0 280 80" class="weight-chart-svg" aria-label="Courbe de poids">
            <!-- Grid lines -->
            <line x1="24" y1="8" x2="24" y2="56" stroke="var(--color-border)" stroke-width="1"/>
            <line x1="24" y1="56" x2="256" y2="56" stroke="var(--color-border)" stroke-width="1"/>
            <!-- Weight path -->
            <path d={weightChartData.path} fill="none" stroke="var(--color-primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <!-- Data points and labels -->
            {#each weightChartData.points as pt}
              <circle cx={pt.x} cy={pt.y} r="4" fill="var(--color-primary)"/>
              <text x={pt.x} y={pt.y - 8} text-anchor="middle" font-size="9" fill="var(--color-text-secondary)">{pt.value}</text>
            {/each}
          </svg>
        </div>
      {:else}
        <div data-testid="weight-chart-insufficient" class="weight-insufficient">
          <span class="weight-value">{weightEventsChron[0]?.payload?.value} kg</span>
          <span class="insufficient-hint">Ajoutez au moins 2 pesées pour voir la courbe</span>
        </div>
      {/if}
    </section>
  {/if}

  <section class="section">
    <div class="section-header"><h2>Rappels</h2><a href="/reminders" class="section-link">Tous →</a></div>
    {#if data.reminders?.length > 0}
      {#each data.reminders.slice(0, 3) as r}
        <div class="reminder-row">
          <div class="reminder-dot" style="background: {statusColor(r.status)}"></div>
          <div class="reminder-info">
            <span class="reminder-name">{r.name}</span>
            <span class="reminder-date">{r.next_due_date}</span>
          </div>
        </div>
      {/each}
    {:else}
      <p class="empty">Aucun rappel</p>
    {/if}
  </section>

  <section class="section" data-testid="pet-timeline">
    <div class="section-header">
      <h2>Activité récente</h2>
      <div class="timeline-actions">
        <a href="/timeline" class="section-link">Tout voir →</a>
        <button class="add-event-btn" data-testid="add-event-btn" onclick={() => showEventForm = !showEventForm}>
          {showEventForm ? '✕' : '+ Ajouter'}
        </button>
      </div>
    </div>

    {#if showEventForm}
      <form class="event-form" data-testid="event-form" onsubmit={(e) => { e.preventDefault(); submitEvent(); }}>
        <select class="event-select" data-testid="event-type" bind:value={eventType}>
          <option value="note">Note</option>
          <option value="weight">Poids</option>
          <option value="vaccine">Vaccin</option>
          <option value="litter_clean">Litière nettoyée</option>
          <option value="food_serve">Repas</option>
          <option value="health_note">Médicament</option>
          <option value="behavior">Observation</option>
          <option value="relation">Relation</option>
          <option value="custom">Autre</option>
        </select>
        <input
          type="datetime-local"
          class="event-date-input"
          data-testid="event-date"
          bind:value={eventDate}
          required
        />
        {#if eventType === 'vaccine'}
          <input
            type="text"
            class="event-text-input"
            data-testid="event-payload-name"
            placeholder="Nom du vaccin (ex: Rage)"
            bind:value={eventPayloadName}
          />
        {/if}
        {#if eventType === 'relation'}
          <select class="event-select" data-testid="event-relation-verb" bind:value={eventRelationVerb}>
            <option value="plays_with">Joue avec</option>
            <option value="fights_with">Se bat avec</option>
            <option value="grooms">Fait la toilette de</option>
            <option value="ignores">Ignore</option>
          </select>
          <select class="event-select" data-testid="event-relation-object" bind:value={eventRelationObject}>
            <option value="">Choisir un animal...</option>
            {#each data.allPets.filter((p: any) => p.id !== data.pet.id) as p}
              <option value={p.id}>{p.name}</option>
            {/each}
          </select>
        {/if}
        {#if eventType === 'note' || eventType === 'behavior' || eventType === 'custom' || eventType === 'relation'}
          <textarea
            class="event-textarea"
            data-testid="event-payload-text"
            placeholder="Décrivez l'observation..."
            bind:value={eventPayloadText}
            rows="2"
          ></textarea>
        {/if}
        <button type="submit" class="event-submit-btn" data-testid="event-submit" disabled={eventSubmitting}>
          {eventSubmitting ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </form>
    {/if}

    {#if recentEvents.length > 0}
      {#each recentEvents as event}
        <div class="activity-row" data-testid="timeline-event">
          <span class="event-icon-wrap" data-testid="event-icon" aria-hidden="true">
            {#if event.type === 'weight'}⚖️
            {:else if event.type === 'vaccine'}💉
            {:else if event.type === 'note'}📝
            {:else if event.type === 'litter_clean'}🪣
            {:else if event.type === 'food_serve'}🥣
            {:else if event.type === 'health_note'}💊
            {:else if event.type === 'behavior'}👁️
            {:else}📋{/if}
          </span>
          <div class="activity-content">
            <span class="activity-type" data-testid="event-type">{getEventTypeLabel(event.type)}</span>
            <span class="activity-date" data-testid="event-date">{new Date(event.occurred_at).toLocaleDateString('fr-FR')}</span>
            {#if event.payload?.value}
              <span class="activity-value">{event.payload.value} {event.payload.unit || ''}</span>
            {/if}
            {#if event.payload?.status}
              <span class="activity-text">{event.payload.status}</span>
            {/if}
            {#if event.payload?.anomalies?.length}
              <span class="activity-text">{event.payload.anomalies.join(', ')}</span>
            {/if}
            {#if event.payload?.appetite}
              <span class="activity-text">{event.payload.appetite}</span>
            {/if}
            {#if event.payload?.text}
              <span class="activity-text">{event.payload.text}</span>
            {/if}
            {#if event.payload?.name}
              <span class="activity-text">{event.payload.name}</span>
            {/if}
            {#if event.payload?.tags?.length}
              <div class="tag-list">
                {#each event.payload.tags as tag}
                  <span class="tag-badge">{tag}</span>
                {/each}
              </div>
            {/if}
          </div>
          <span class="activity-when">{getTimeAgo(event.occurred_at)}</span>
        </div>
      {/each}
    {:else}
      <p class="empty" data-testid="timeline-empty">Aucune activité enregistrée</p>
    {/if}
  </section>

  {#if photoEvents.length > 0}
    <section class="section" data-testid="photo-gallery">
      <div class="section-header"><h2>Photos</h2></div>
      <div class="photo-grid">
        {#each photoEvents as ev}
          <div class="photo-thumb">
            <img src={ev.payload.photo_url} alt="" loading="lazy" />
            <span class="photo-date">{new Date(ev.occurred_at).toLocaleDateString('fr-FR')}</span>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  <a href="/pets/{data.pet.id}/vet" class="share-btn" data-testid="vet-link">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4.8 2.3A.3.3 0 015 2h14a.3.3 0 01.2.3L18 10H6L4.8 2.3z"/><path d="M6 10v9a3 3 0 003 3h6a3 3 0 003-3v-9"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/></svg>
    Partager avec mon vétérinaire
  </a>

  <details class="details-section">
    <summary>Informations complètes</summary>
    <div class="info-grid">
      {#if data.pet.sterilized != null}<div class="info-item"><span class="info-label">Stérilisé</span><span>{data.pet.sterilized ? 'Oui' : 'Non'}</span></div>{/if}
      {#if data.pet.vet_name}<div class="info-item"><span class="info-label">Vétérinaire</span><span>{data.pet.vet_name}</span></div>{/if}
      {#if data.pet.vet_phone}<div class="info-item"><span class="info-label">Tél.</span><span>{data.pet.vet_phone}</span></div>{/if}
      {#if data.pet.birth_date}<div class="info-item"><span class="info-label">Naissance</span><span>{new Date(data.pet.birth_date).toLocaleDateString('fr-FR')}</span></div>{/if}
    </div>
  </details>
</div>

<style>
  .profile { max-width: 500px; margin: 0 auto; padding: 52px var(--space-lg) var(--space-lg); }
  .hero { display: flex; gap: var(--space-lg); align-items: flex-start; background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-lg); margin-bottom: var(--space-lg); box-shadow: var(--elevation-sm); position: relative; }
  .hero-avatar { width: 72px; height: 72px; border-radius: 22px; background: linear-gradient(135deg, #ddd6fe, #a29bfe); display: flex; align-items: center; justify-content: center; font-size: 36px; flex-shrink: 0; overflow: hidden; }
  .hero-avatar img { width: 100%; height: 100%; object-fit: cover; }
  h1 { font-family: var(--font-display); font-size: var(--text-2xl); margin-bottom: 2px; }
  .hero-meta { font-size: var(--text-sm); color: var(--color-text-secondary); }
  .hero-chip { font-size: var(--text-xs); color: var(--color-text-muted); margin-top: 2px; }
  .edit-btn { position: absolute; top: var(--space-md); right: var(--space-md); color: var(--color-text-muted); }
  .edit-btn svg { width: 18px; height: 18px; }
  .alert-card { display: flex; align-items: center; gap: var(--space-md); padding: var(--space-md) var(--space-lg); background: rgba(225,112,85,0.06); border-left: 3px solid var(--color-error); border-radius: var(--radius-md); margin-bottom: var(--space-md); font-size: var(--text-sm); }
  .alert-card svg { width: 20px; height: 20px; flex-shrink: 0; }
  .section { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-lg); margin-bottom: var(--space-md); box-shadow: var(--elevation-sm); }
  .section-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--space-md); }
  .section-header h2 { font-family: var(--font-display); font-size: var(--text-lg); }
  .section-link { font-size: var(--text-xs); color: var(--color-primary); font-weight: 500; }
  .weight-summary { display: flex; align-items: baseline; gap: var(--space-md); }
  .weight-value { font-size: var(--text-3xl); font-weight: 700; font-family: var(--font-display); }
  .weight-trend { font-size: var(--text-sm); font-weight: 500; color: var(--color-success); }
  .weight-trend.up { color: var(--color-warning); }
  .weight-trend.down { color: var(--color-error); }
  .reminder-row { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) 0; border-bottom: 1px solid var(--color-border); }
  .reminder-row:last-child { border-bottom: none; }
  .reminder-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .reminder-info { flex: 1; }
  .reminder-name { font-size: var(--text-sm); font-weight: 500; display: block; }
  .reminder-date { font-size: var(--text-xs); color: var(--color-text-muted); }
  .activity-row { display: flex; align-items: flex-start; gap: var(--space-sm); padding: var(--space-sm) 0; border-bottom: 1px solid var(--color-border); font-size: var(--text-sm); }
  .activity-row:last-child { border-bottom: none; }
  .event-icon-wrap { font-size: 16px; flex-shrink: 0; padding-top: 2px; }
  .activity-content { flex: 1; display: flex; flex-direction: column; gap: 2px; }
  .activity-type { font-weight: 500; text-transform: capitalize; }
  .activity-date { font-size: var(--text-xs); color: var(--color-text-muted); }
  .activity-value { font-weight: 600; color: var(--color-primary); font-size: var(--text-sm); }
  .activity-text { font-size: var(--text-xs); color: var(--color-text-secondary); }
  .activity-when { font-size: var(--text-xs); color: var(--color-text-muted); flex-shrink: 0; }
  .share-btn { display: flex; align-items: center; justify-content: center; gap: var(--space-sm); width: 100%; padding: var(--space-lg); background: var(--color-primary); color: white; border-radius: var(--radius-lg); font-size: var(--text-md); font-weight: 600; text-decoration: none; margin: var(--space-xl) 0; }
  .share-btn:hover { text-decoration: none; opacity: 0.9; }
  .share-btn svg { width: 22px; height: 22px; }
  .details-section summary { font-size: var(--text-sm); color: var(--color-text-muted); cursor: pointer; }
  .info-grid { display: flex; flex-direction: column; gap: var(--space-xs); padding-top: var(--space-sm); }
  .info-item { display: flex; justify-content: space-between; font-size: var(--text-sm); }
  .info-label { color: var(--color-text-muted); }
  .empty { font-size: var(--text-sm); color: var(--color-text-muted); }
  .inline-link { color: var(--color-primary); font-weight: 500; }
  /* Fast action grid */
  .fast-action-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-sm);
    margin-bottom: var(--space-md);
  }
  .fast-action {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-md) var(--space-sm);
    background: var(--color-surface);
    border: 1.5px solid var(--color-border);
    border-radius: var(--radius-lg);
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all 0.15s;
    min-height: 64px;
  }
  .fast-action:hover { border-color: var(--color-primary-light); color: var(--color-primary); background: var(--color-primary-soft); }
  .fast-action svg { width: 22px; height: 22px; }
  [data-testid="fast-action-litter"]  { background: #fffbeb; border-color: #fde68a; color: #92660a; }
  [data-testid="fast-action-litter"] svg { stroke: #b8860b; }
  [data-testid="fast-action-food"]    { background: #f0fdfd; border-color: #a7f3f0; color: #0e7a77; }
  [data-testid="fast-action-food"] svg { stroke: #0e8a86; }
  [data-testid="fast-action-weight"]  { background: #f5f3ff; border-color: #ddd6fe; color: #5b4bc9; }
  [data-testid="fast-action-weight"] svg { stroke: #5b4bc9; }
  [data-testid="fast-action-health"]  { background: #fff5f3; border-color: #fecaca; color: #c0533a; }
  [data-testid="fast-action-health"] svg { stroke: #c0533a; }
  /* Event form */
  .timeline-actions { display: flex; align-items: center; gap: var(--space-sm); }
  .add-event-btn {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-primary);
    background: var(--color-primary-soft);
    border: none;
    border-radius: var(--radius-full);
    padding: 3px 10px;
    cursor: pointer;
    white-space: nowrap;
  }
  .event-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    padding: var(--space-md);
    background: var(--color-bg);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-md);
    border: 1px solid var(--color-border);
  }
  .event-select,
  .event-date-input,
  .event-text-input,
  .event-textarea {
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    border: 1.5px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    background: var(--color-surface);
    color: var(--color-text);
    box-sizing: border-box;
  }
  .event-textarea { resize: vertical; min-height: 56px; }
  .event-submit-btn {
    padding: var(--space-sm) var(--space-lg);
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: 600;
    cursor: pointer;
    align-self: flex-end;
  }
  .event-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .pet-switcher {
    display: flex;
    gap: var(--space-xs);
    overflow-x: auto;
    padding: var(--space-xs) 0 var(--space-md);
    scrollbar-width: none;
  }
  .switcher-item {
    flex-shrink: 0;
    padding: var(--space-xs) var(--space-md);
    border-radius: var(--radius-full);
    font-size: var(--text-sm);
    font-weight: 500;
    text-decoration: none;
    color: var(--color-text-secondary);
    background: var(--color-surface);
    border: 1.5px solid var(--color-border);
    transition: all 0.15s;
  }
  .switcher-item.active {
    background: var(--color-primary-soft);
    border-color: var(--color-primary-light);
    color: var(--color-primary);
  }
  .switcher-item:hover { text-decoration: none; border-color: var(--color-primary-light); }

  /* Decision tree modal */
  .tree-overlay {
    position: fixed; inset: 0; z-index: 100;
    background: rgba(0,0,0,0.45); backdrop-filter: blur(2px);
    display: flex; align-items: flex-end; justify-content: center;
  }
  .tree-modal {
    background: var(--color-surface);
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    padding: var(--space-xl);
    width: 100%; max-width: 500px;
    box-shadow: var(--elevation-lg);
    position: relative;
    padding-bottom: calc(var(--space-xl) + env(safe-area-inset-bottom, 0px));
  }
  .tree-close {
    position: absolute; top: var(--space-md); right: var(--space-md);
    background: var(--color-bg); border: none; width: 32px; height: 32px;
    border-radius: 50%; font-size: 14px; cursor: pointer;
    color: var(--color-text-muted); display: flex; align-items: center; justify-content: center;
  }
  .tree-title { font-family: var(--font-display); font-size: var(--text-xl); margin-bottom: 4px; }
  .tree-subtitle { font-size: var(--text-sm); color: var(--color-text-muted); margin-bottom: var(--space-lg); }
  .tree-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-sm); margin-bottom: var(--space-xl); }
  .tree-option {
    padding: var(--space-md) var(--space-sm); background: var(--color-bg);
    border: 1.5px solid var(--color-border); border-radius: var(--radius-lg);
    font-size: var(--text-sm); font-family: var(--font-default); cursor: pointer;
    text-align: center; transition: all 0.15s; color: var(--color-text-secondary);
  }
  .tree-option:hover { border-color: var(--color-primary-light); color: var(--color-primary); }
  .tree-option.selected { border-color: var(--color-primary); background: var(--color-primary-soft); color: var(--color-primary); font-weight: 600; }
  .tree-weight-input { display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-xl); }
  .tree-number-input {
    flex: 1; padding: var(--space-lg); border: 1.5px solid var(--color-border);
    border-radius: var(--radius-lg); font-size: var(--text-3xl); text-align: center;
    font-family: var(--font-default); background: var(--color-bg);
  }
  .tree-number-input:focus { outline: none; border-color: var(--color-primary-light); }
  .tree-unit { font-size: var(--text-xl); color: var(--color-text-muted); font-weight: 600; }
  .tree-save-btn {
    width: 100%; padding: var(--space-lg); background: var(--color-primary); color: white;
    border: none; border-radius: var(--radius-lg); font-size: var(--text-md);
    font-weight: 600; cursor: pointer; font-family: var(--font-default);
  }
  .tree-save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  /* Weight chart */
  .weight-badge { font-size: var(--text-sm); font-weight: 700; color: var(--color-primary); }
  .weight-chart-wrap { margin-top: var(--space-sm); }
  .weight-chart-svg { width: 100%; height: auto; display: block; }
  .weight-insufficient { display: flex; flex-direction: column; gap: var(--space-xs); padding: var(--space-sm) 0; }
  .insufficient-hint { font-size: var(--text-xs); color: var(--color-text-muted); }

  /* Photo gallery */
  .photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-sm); }
  .photo-thumb { position: relative; border-radius: var(--radius-md); overflow: hidden; aspect-ratio: 1; background: var(--color-bg); }
  .photo-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .photo-date {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 3px var(--space-xs); background: rgba(0,0,0,0.5);
    color: white; font-size: 9px; text-align: center;
  }

  /* Tag badges */
  .tag-list { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 3px; }
  .tag-badge {
    display: inline-block; padding: 2px 7px;
    background: var(--color-primary-soft); color: var(--color-primary);
    border-radius: var(--radius-full); font-size: 10px; font-weight: 500;
    text-transform: lowercase;
  }

  /* Correlation card */
  .correlation-card { border-left: 3px solid var(--color-warning); }
  .corr-icon { width: 18px; height: 18px; flex-shrink: 0; }
  .correlation-text { font-size: var(--text-sm); color: var(--color-text-secondary); margin-top: var(--space-xs); }
</style>
