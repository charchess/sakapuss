<script lang="ts">
  let { data } = $props();

  function getSpeciesEmoji(species: string): string {
    if (species?.toLowerCase().includes('cat') || species?.toLowerCase().includes('chat')) return '🐱';
    if (species?.toLowerCase().includes('dog') || species?.toLowerCase().includes('chien')) return '🐶';
    return '🐾';
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

  const weightEvents = $derived(
    data.events.filter((e: any) => e.type === 'weight' && e.payload?.value)
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

  const recentEvents = $derived(data.events.slice(0, 5));
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
        {data.pet.species}
        {#if data.pet.breed} · {data.pet.breed}{/if}
        {#if data.pet.birth_date} · {getAge(data.pet.birth_date)}{/if}
      </p>
      {#if data.pet.microchip}<p class="hero-chip">Puce: {data.pet.microchip}</p>{/if}
    </div>
    <a href="/pets/{data.pet.id}/edit" class="edit-btn" aria-label="Modifier">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
    </a>
  </div>

  {#if data.anomalies?.length > 0}
    {#each data.anomalies as anomaly}
      <div class="alert-card">
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" stroke-width="2" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <span>{anomaly.description}</span>
      </div>
    {/each}
  {/if}

  <section class="section">
    <div class="section-header"><h2>Poids</h2></div>
    {#if latestWeight}
      <div class="weight-summary">
        <span class="weight-value">{latestWeight} kg</span>
        {#if weightTrendDir}
          <span class="weight-trend" class:up={weightTrendDir === 'up'} class:down={weightTrendDir === 'down'}>
            {weightTrendDir === 'up' ? '↑ en hausse' : weightTrendDir === 'down' ? '↓ en baisse' : '→ stable'}
          </span>
        {/if}
      </div>
    {:else}
      <p class="empty">Aucun poids enregistré</p>
    {/if}
  </section>

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

  <section class="section">
    <div class="section-header"><h2>Activité récente</h2><a href="/timeline" class="section-link">Tout voir →</a></div>
    {#if recentEvents.length > 0}
      {#each recentEvents as event}
        <div class="activity-row">
          <span class="activity-type">{event.type.replace(/_/g, ' ')}</span>
          {#if event.payload?.value}<span class="activity-value">{event.payload.value} {event.payload.unit || ''}</span>{/if}
          <span class="activity-when">{getTimeAgo(event.occurred_at)}</span>
        </div>
      {/each}
    {:else}
      <p class="empty">Aucune activité</p>
    {/if}
  </section>

  <a href="/settings/vet-sharing" class="share-btn">
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
  .activity-row { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-xs) 0; font-size: var(--text-sm); }
  .activity-type { flex: 1; text-transform: capitalize; }
  .activity-value { font-weight: 600; color: var(--color-primary); }
  .activity-when { font-size: var(--text-xs); color: var(--color-text-muted); }
  .share-btn { display: flex; align-items: center; justify-content: center; gap: var(--space-sm); width: 100%; padding: var(--space-lg); background: var(--color-primary); color: white; border-radius: var(--radius-lg); font-size: var(--text-md); font-weight: 600; text-decoration: none; margin: var(--space-xl) 0; }
  .share-btn:hover { text-decoration: none; opacity: 0.9; }
  .share-btn svg { width: 22px; height: 22px; }
  .details-section summary { font-size: var(--text-sm); color: var(--color-text-muted); cursor: pointer; }
  .info-grid { display: flex; flex-direction: column; gap: var(--space-xs); padding-top: var(--space-sm); }
  .info-item { display: flex; justify-content: space-between; font-size: var(--text-sm); }
  .info-label { color: var(--color-text-muted); }
  .empty { font-size: var(--text-sm); color: var(--color-text-muted); }
  .inline-link { color: var(--color-primary); font-weight: 500; }
</style>
