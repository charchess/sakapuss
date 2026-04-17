<script lang="ts">
  let { data } = $props();

  const bowl = data.bowl;
  const servings = data.servings;

  function formatDateTime(dt: string): string {
    return new Date(dt).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
</script>

<svelte:head>
  <title>{bowl ? bowl.name : 'Gamelle'} — Sakapuss</title>
</svelte:head>

<section class="bowl-detail-page">
  <a href="/bowls" class="back-link">← Gamelles</a>

  {#if bowl}
    <div class="bowl-header">
      <div class="bowl-icon" class:water={bowl.bowl_type === 'water'}>
        {#if bowl.bowl_type === 'water'}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M12 2c-4 6-6 9-6 12a6 6 0 0012 0c0-3-2-6-6-12z"/>
          </svg>
        {:else}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M4 12a8 8 0 0016 0"/><path d="M3 12h18"/>
          </svg>
        {/if}
      </div>
      <div class="bowl-header-info">
        <h1 class="bowl-name">{bowl.name}</h1>
        <span class="bowl-meta">
          {bowl.location}
          {#if bowl.capacity_ml || bowl.capacity_g}
            · {bowl.capacity_ml || bowl.capacity_g}{bowl.bowl_type === 'water' ? ' ml' : ' g'}
          {/if}
          · {bowl.bowl_type === 'water' ? 'Eau' : 'Nourriture'}
        </span>
      </div>
    </div>

    <div class="history-section" data-testid="water-history">
      <h2 class="history-title">Historique des remplissages</h2>

      {#if servings.length === 0}
        <div class="empty-history">
          <p>Aucun remplissage enregistré.</p>
        </div>
      {:else}
        <div class="history-list">
          {#each servings as serving}
            <div class="history-entry" data-testid="water-history-entry">
              <div class="entry-time">{formatDateTime(serving.served_at)}</div>
              <div class="entry-details">
                {#if serving.amount_ml}
                  <span class="amount">{serving.amount_ml} ml</span>
                {:else if serving.amount_g}
                  <span class="amount">{serving.amount_g} g</span>
                {/if}
                {#if serving.remaining_ml != null && serving.amount_ml != null}
                  <span class="consumed">{serving.amount_ml - serving.remaining_ml} ml consumed</span>
                {/if}
                {#if serving.notes}
                  <span class="notes">{serving.notes}</span>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {:else}
    <div class="not-found">
      <p>Gamelle introuvable.</p>
    </div>
  {/if}
</section>

<style>
  .bowl-detail-page { max-width: 600px; padding: 52px var(--space-lg) var(--space-lg); }

  .back-link {
    display: inline-block; color: var(--color-primary);
    font-size: var(--text-sm); margin-bottom: var(--space-xl);
  }
  .back-link:hover { text-decoration: underline; }

  .bowl-header {
    display: flex; align-items: center; gap: var(--space-md);
    background: var(--color-surface); border-radius: var(--radius-xl);
    padding: var(--space-xl); box-shadow: var(--elevation-sm);
    margin-bottom: var(--space-xl);
  }

  .bowl-icon {
    width: 52px; height: 52px; border-radius: var(--radius-lg);
    background: var(--color-primary-soft);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .bowl-icon svg { width: 26px; height: 26px; stroke: var(--color-primary); }
  .bowl-icon.water { background: rgba(116, 185, 255, 0.15); }
  .bowl-icon.water svg { stroke: #74b9ff; }

  .bowl-header-info { flex: 1; }
  .bowl-name {
    font-family: var(--font-display); font-size: var(--text-xl);
    font-weight: 800; color: var(--color-primary); margin: 0 0 var(--space-xs);
  }
  .bowl-meta { font-size: var(--text-sm); color: var(--color-text-muted); }

  .history-section {
    background: var(--color-surface); border-radius: var(--radius-xl);
    padding: var(--space-xl); box-shadow: var(--elevation-sm);
  }

  .history-title {
    font-family: var(--font-display); font-size: var(--text-lg);
    font-weight: 700; color: var(--color-text-primary);
    margin: 0 0 var(--space-lg);
  }

  .empty-history {
    text-align: center; padding: var(--space-xl);
    color: var(--color-text-muted); font-size: var(--text-sm);
  }

  .history-list { display: flex; flex-direction: column; gap: var(--space-sm); }

  .history-entry {
    display: flex; align-items: flex-start; gap: var(--space-md);
    padding: var(--space-md); background: var(--color-bg);
    border-radius: var(--radius-lg);
  }

  .entry-time {
    font-size: var(--text-xs); color: var(--color-text-muted);
    white-space: nowrap; flex-shrink: 0; padding-top: 2px;
    min-width: 120px;
  }

  .entry-details {
    display: flex; flex-wrap: wrap; gap: var(--space-xs); align-items: center;
  }

  .amount {
    font-size: var(--text-sm); font-weight: 600; color: var(--color-text-primary);
    background: var(--color-primary-soft); padding: 2px var(--space-sm);
    border-radius: var(--radius-full);
  }

  .consumed {
    font-size: var(--text-sm); color: #74b9ff; font-weight: 500;
  }

  .notes {
    font-size: var(--text-xs); color: var(--color-text-muted); font-style: italic;
  }

  .not-found {
    text-align: center; padding: var(--space-3xl);
    color: var(--color-text-muted);
  }
</style>
