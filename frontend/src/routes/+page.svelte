<script lang="ts">
  import QuickLogSheet from '$lib/components/QuickLogSheet.svelte';
  import ConfirmationToast from '$lib/components/ConfirmationToast.svelte';

  let { data } = $props();

  const initialIndex = data.selectedPetId
    ? Math.max(0, data.pets.findIndex((p: any) => p.id === data.selectedPetId))
    : 0;
  let selectedPetIndex = $state(initialIndex);
  const selectedPet = $derived(data.pets[selectedPetIndex] || null);
  const litterResources = $derived(data.resources.filter((r: any) => r.type === 'litter'));
  // Quick Log state
  let sheetOpen = $state(false);
  let sheetAction = $state('');
  let toastVisible = $state(false);
  let loggedEvent = $state<any>(null);

  function openQuickLog(action: string) {
    sheetAction = action;
    sheetOpen = true;
  }

  function onEventLogged(event: any) {
    loggedEvent = event;
    toastVisible = true;
  }

  const allTiles = [
    { action: 'litter_clean', label: 'Caisse nettoyée', class: 'act-litter', requires: 'litter' },
    { action: 'food_serve', label: 'Gamelle remplie', class: 'act-food', requires: 'bowls' },
    { action: 'weight', label: 'Pesée', class: 'act-weight', requires: null },
    { action: 'health_note', label: 'Médicament', class: 'act-medicine', requires: null },
    { action: 'behavior', label: 'Observation', class: 'act-observation', requires: null },
    { action: 'custom', label: 'Événement', class: 'act-event', requires: null },
  ];

  const actionTiles = $derived(
    allTiles.filter(t => {
      if (t.requires === 'litter') return litterResources.length > 0;
      if (t.requires === 'bowls') return data.bowls.length > 0;
      return true;
    })
  );

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

  function getEventLabel(type: string): string {
    const labels: Record<string, string> = {
      weight: 'Pesée',
      litter_clean: 'Litière nettoyée',
      litter: 'Litière',
      food_serve: 'Gamelle remplie',
      food: 'Alimentation',
      health_note: 'Médicament',
      behavior: 'Observation',
      custom: 'Événement',
      vaccine: 'Vaccin',
      treatment: 'Traitement',
      note: 'Note',
      relation: 'Relation',
    };
    return labels[type] || type;
  }

  function getTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "à l'instant";
    if (hours < 24) return `il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return days === 1 ? 'hier' : `il y a ${days}j`;
  }
</script>

<svelte:head>
  <title>Sakapuss — Dashboard</title>
</svelte:head>

<div class="dashboard">
  {#if data.pets.length === 0}
    <!-- Empty state -->
    <div class="empty-state">
      <div class="empty-icon">🐱</div>
      <h1>Bienvenue sur Sakapuss</h1>
      <p>Ajoute ton premier animal pour commencer</p>
      <a href="/pets/new" class="btn-primary" data-testid="add-pet-btn">Ajouter un animal</a>
    </div>
  {:else}
    <!-- Header -->
    <div class="header">
      <div class="greeting">
        <h1>Salut !</h1>
        <span>{data.pets.length} {data.pets.length > 1 ? 'animaux' : 'animal'}</span>
      </div>
      <div class="header-right">
        <div class="avatar-group">
          {#each data.pets as pet, i}
            <a
              href="/pets/{pet.id}"
              class="h-avatar"
              class:active={selectedPetIndex === i}
              aria-label={pet.name}
            >
              {#if pet.photo_url}
                <img src={pet.photo_url} alt={pet.name} />
              {:else}
                {getSpeciesEmoji(pet.species)}
              {/if}
            </a>
          {/each}
        </div>
        <a href="/pets/new" class="h-avatar-add" data-testid="add-pet-btn" aria-label="Ajouter un animal">+</a>
      </div>
    </div>

    <!-- Animal Hero Card -->
    {#if selectedPet}
      <a href="/pets/{selectedPet.id}" class="animal-card" aria-label="Voir le profil">
        <div class="animal-face">
          {#if selectedPet.photo_url}
            <img src={selectedPet.photo_url} alt={selectedPet.name} />
          {:else}
            {getSpeciesEmoji(selectedPet.species)}
          {/if}
        </div>
        <div class="animal-speech">
          <div class="animal-name">{selectedPet.name}</div>
          <div class="animal-bubble">
            <em>{getSpeciesLabel(selectedPet.species)}</em>
            {#if selectedPet.breed} · {selectedPet.breed}{/if}
          </div>
        </div>
      </a>
    {/if}

    <!-- Reminder Nudge -->
    {#if data.pendingReminders.length > 0}
      {@const r = data.pendingReminders[0]}
      <a href="/reminders" class="reminder-nudge">
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-cat-health)" stroke-width="2" stroke-linecap="round" class="nudge-icon">
          <rect x="5" y="9" width="14" height="6" rx="3" transform="rotate(-30 12 12)"/>
        </svg>
        <div class="nudge-text">
          <span class="nudge-title">{r.name}{r.pet_name ? ` de ${r.pet_name}` : ''}</span>
          <span class="nudge-date">{r.next_due_date}</span>
        </div>
        {#if data.pendingReminders.length > 1}
          <span class="nudge-badge">+{data.pendingReminders.length - 1}</span>
        {/if}
        <span class="nudge-arrow">›</span>
      </a>
    {/if}

    <!-- Action Garden -->
    <div class="action-section">
      <div class="section-label">Qu'est-ce que tu viens de faire ?</div>
      <div class="action-garden">
        {#each actionTiles as tile}
          <button class="action-item {tile.class}" data-testid="action-{tile.action}" onclick={() => openQuickLog(tile.action)}>
            <div class="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                {#if tile.action === 'litter_clean'}
                  <path d="M12 3v5M8 5l1.5 3M16 5l-1.5 3"/>
                  <path d="M7 10h10l-1.5 8a2 2 0 01-2 1.5h-3a2 2 0 01-2-1.5L7 10z"/>
                {:else if tile.action === 'food_serve'}
                  <path d="M4 12a8 8 0 0016 0"/><path d="M3 12h18"/>
                {:else if tile.action === 'weight'}
                  <rect x="4" y="8" width="16" height="12" rx="3"/>
                  <circle cx="12" cy="14" r="3.5"/><path d="M12 12v2l1.5 1"/>
                {:else if tile.action === 'health_note'}
                  <rect x="5" y="9" width="14" height="6" rx="3" transform="rotate(-30 12 12)"/>
                {:else if tile.action === 'behavior'}
                  <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"/>
                  <circle cx="12" cy="12" r="3"/>
                {:else}
                  <rect x="3" y="5" width="18" height="16" rx="2"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                  <line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/>
                {/if}
              </svg>
            </div>
            <div class="action-label">{tile.label}</div>
          </button>
        {/each}
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="recent-section">
      <div class="section-header">
        <span class="section-title">Aujourd'hui</span>
        <a href="/timeline" class="see-all">Tout voir</a>
      </div>
      {#if data.recentEvents.length === 0}
        <p class="empty-hint">Aucune activité — tape une action ci-dessus</p>
      {:else}
        {#each data.recentEvents as event}
          <div class="stream-item">
            <div class="stream-dot" style="background: var(--color-cat-{event.type === 'weight' ? 'weight' : event.type === 'litter_clean' ? 'litter' : 'event'})"></div>
            <div class="stream-content">
              <span class="stream-text">{getEventLabel(event.type)}</span>
              <span class="stream-when">{getTimeAgo(event.occurred_at || event.created_at)}</span>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  {/if}

  <!-- Management shortcuts — always visible -->
  <div class="mgmt-section">
    <a href="/bowls" class="mgmt-link" data-testid="bowls-link">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M4 12a8 8 0 0016 0"/><path d="M3 12h18"/>
      </svg>
      Gamelles
    </a>
    <a href="/food" class="mgmt-link" data-testid="food-link">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      Aliments
    </a>
    <a href="/reminders" class="mgmt-link" data-testid="reminders-link">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M18 8A6 6 0 106 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
      </svg>
      Rappels
    </a>
  </div>
</div>

<!-- Quick Log components -->
<QuickLogSheet
  bind:open={sheetOpen}
  action={sheetAction}
  pets={data.pets}
  litterResources={litterResources}
  bowlResources={data.bowls}
  foodProducts={data.foodProducts}
  onLogged={onEventLogged}
/>
<ConfirmationToast
  bind:visible={toastVisible}
  event={loggedEvent}
/>

<style>
  .dashboard {
    padding: 52px var(--space-lg) var(--space-lg);
  }


  /* Empty state */
  .empty-state {
    text-align: center;
    padding: var(--space-3xl) var(--space-lg);
  }
  .empty-icon { font-size: 64px; margin-bottom: var(--space-lg); }
  .empty-state h1 {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    margin-bottom: var(--space-sm);
  }
  .empty-state p { color: var(--color-text-muted); margin-bottom: var(--space-xl); }
  .btn-primary {
    display: inline-block;
    padding: var(--space-md) var(--space-xl);
    background: var(--color-primary);
    color: white;
    border-radius: var(--radius-lg);
    font-weight: 600;
    text-decoration: none;
  }

  /* Header */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-md);
  }
  .greeting h1 {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 800;
  }
  .greeting span {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }
  .header-right { display: flex; align-items: center; }
  .h-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 2.5px solid var(--color-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    cursor: pointer;
    background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
    transition: transform 0.2s;
    margin-left: -8px;
    overflow: hidden;
  }
  .h-avatar:first-child { margin-left: 0; }

  .h-avatar.active { transform: scale(1.12); z-index: 2; border-color: var(--color-primary); }
  .h-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .avatar-group { display: flex; align-items: center; }
  .h-avatar-add {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    font-size: 22px;
    font-weight: 300;
    background: transparent;
    border: 2px dashed var(--color-border);
    color: var(--color-text-muted);
    line-height: 1;
    margin-left: var(--space-xs);
    transition: border-color 0.2s, color 0.2s;
  }
  .h-avatar-add:hover { border-color: var(--color-primary); color: var(--color-primary); }

  /* Animal hero card */
  .animal-card {
    background: var(--color-surface);
    border-radius: var(--radius-xl);
    padding: var(--space-lg);
    display: flex;
    gap: var(--space-md);
    align-items: flex-start;
    box-shadow: 0 2px 16px rgba(108, 92, 231, 0.07);
    text-decoration: none;
    color: inherit;
    margin-bottom: var(--space-xl);
    transition: transform 0.2s;
  }
  .animal-card:hover { text-decoration: none; }
  .animal-card:active { transform: scale(0.98); }
  .animal-face {
    width: 56px;
    height: 56px;
    border-radius: 18px;
    background: linear-gradient(135deg, #ddd6fe, #a29bfe);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
    flex-shrink: 0;
    overflow: hidden;
  }
  .animal-face img { width: 100%; height: 100%; object-fit: cover; }
  .animal-name {
    font-family: var(--font-display);
    font-size: 15px;
    font-weight: 700;
    color: var(--color-text-primary);
  }
  .animal-bubble {
    font-size: 13px;
    color: var(--color-text-secondary);
    font-style: italic;
  }
  .animal-bubble em { color: var(--color-primary); font-style: normal; font-weight: 600; }

  /* Reminder Nudge */
  .reminder-nudge {
    display: flex; align-items: center; gap: var(--space-md);
    padding: var(--space-md) var(--space-lg);
    background: linear-gradient(135deg, rgba(225,112,85,0.06), rgba(253,203,110,0.04));
    border-radius: var(--radius-lg); margin-bottom: var(--space-lg);
    text-decoration: none; color: inherit; transition: transform 0.15s;
  }
  .reminder-nudge:hover { text-decoration: none; }
  .reminder-nudge:active { transform: scale(0.98); }
  .nudge-icon { width: 22px; height: 22px; flex-shrink: 0; }
  .nudge-text { flex: 1; }
  .nudge-title { display: block; font-size: var(--text-sm); font-weight: 600; color: var(--color-text-primary); }
  .nudge-date { font-size: var(--text-xs); color: var(--color-text-muted); }
  .nudge-badge {
    font-size: var(--text-xs); font-weight: 600; padding: 2px 8px;
    background: rgba(225,112,85,0.1); color: var(--color-error);
    border-radius: var(--radius-full);
  }
  .nudge-arrow { color: var(--color-text-muted); font-size: 18px; }

  /* Action Garden */
  .action-section { margin-bottom: var(--space-xl); }
  .section-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.7px;
    margin-bottom: var(--space-lg);
  }
  .action-garden {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 18px 14px;
  }
  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 6px 0;
    background: none;
    border: none;
    -webkit-tap-highlight-color: transparent;
  }
  .action-icon {
    width: 62px;
    height: 62px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .action-icon svg { width: 28px; height: 28px; }
  .action-item:active .action-icon { transform: scale(0.88); }
  .action-label {
    font-size: 12.5px;
    font-weight: 500;
    color: var(--color-text-secondary);
    text-align: center;
  }

  /* Action colors */
  .act-litter .action-icon { background: linear-gradient(145deg, #fef9e7, #fde68a); box-shadow: 0 5px 16px rgba(253,203,110,0.28); }
  .act-litter .action-icon svg { stroke: #b8860b; }
  .act-food .action-icon { background: linear-gradient(145deg, #d5f5f3, #81ecec); box-shadow: 0 5px 16px rgba(0,206,201,0.22); }
  .act-food .action-icon svg { stroke: #0e8a86; }
  .act-weight .action-icon { background: linear-gradient(145deg, #ede9fe, #c4b5fd); box-shadow: 0 5px 16px rgba(108,92,231,0.2); border-radius: 50%; }
  .act-weight .action-icon svg { stroke: #5b4bc9; }
  .act-medicine .action-icon { background: linear-gradient(145deg, #fde8e2, #f8a89a); box-shadow: 0 5px 16px rgba(225,112,85,0.2); border-radius: 16px 22px 16px 22px; }
  .act-medicine .action-icon svg { stroke: #c0533a; }
  .act-observation .action-icon { background: linear-gradient(145deg, #ede3ff, #d0b8ff); box-shadow: 0 5px 16px rgba(162,155,254,0.22); border-radius: 22px 18px 22px 18px; }
  .act-observation .action-icon svg { stroke: #7c5cbf; }
  .act-event .action-icon { background: linear-gradient(145deg, #dbeafe, #93c5fd); box-shadow: 0 5px 16px rgba(74,111,165,0.18); }
  .act-event .action-icon svg { stroke: #4a6fa5; }

  /* Management shortcuts */
  .mgmt-section {
    display: flex;
    gap: var(--space-sm);
    margin-bottom: var(--space-xl);
  }
  .mgmt-link {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-xs);
    padding: var(--space-sm) var(--space-md);
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    text-decoration: none;
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-text-secondary);
    box-shadow: var(--elevation-sm);
    transition: background 0.15s, color 0.15s;
  }
  .mgmt-link:hover { background: var(--color-primary-soft); color: var(--color-primary); text-decoration: none; }
  .mgmt-link svg { width: 14px; height: 14px; opacity: 0.7; }

  /* Recent activity */
  .recent-section { padding-top: var(--space-lg); }
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: var(--space-lg);
  }
  .section-title {
    font-family: var(--font-display);
    font-size: 16px;
    font-weight: 700;
  }
  .see-all { font-size: 13px; color: var(--color-primary); font-weight: 500; }
  .empty-hint { font-size: var(--text-sm); color: var(--color-text-muted); text-align: center; padding: var(--space-xl) 0; }
  .stream-item {
    display: flex;
    gap: var(--space-md);
    padding: var(--space-md) 0;
    border-top: 1px solid rgba(237, 233, 254, 0.5);
  }
  .stream-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-top: 6px;
    flex-shrink: 0;
  }
  .stream-content { flex: 1; display: flex; justify-content: space-between; }
  .stream-text { font-size: var(--text-sm); color: var(--color-text-primary); }
  .stream-when { font-size: var(--text-xs); color: var(--color-text-muted); }
</style>
