<script lang="ts">
  import { getApiUrl } from '$lib/api';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  const token = $derived($page.params.token);
  let dossier = $state<any>(null);
  let error = $state('');

  onMount(async () => {
    const res = await fetch(`${getApiUrl()}/vet/dossier/${token}`);
    if (res.status === 410) { error = 'Ce dossier n\'est plus partagé.'; return; }
    if (!res.ok) { error = 'Dossier introuvable.'; return; }
    dossier = await res.json();
  });
</script>

<div class="vet-dossier">
  {#if error}
    <div class="error-page"><h1>{error}</h1></div>
  {:else if dossier}
    <div class="portal-banner">
      <p>Créez votre portail cabinet pour centraliser tous vos patients</p>
      <a href="/vet/dashboard" class="banner-link">Créer mon portail</a>
    </div>

    <div class="dossier-content">
      <div class="pet-identity">
        <div class="pet-avatar">🐱</div>
        <div>
          <h1>{dossier.pet.name}</h1>
          <p>{dossier.pet.species} {dossier.pet.breed ? `· ${dossier.pet.breed}` : ''}</p>
          {#if dossier.pet.microchip}<p class="chip">Puce: {dossier.pet.microchip}</p>{/if}
        </div>
      </div>

      <section class="section">
        <h2>Rappels actifs</h2>
        {#each dossier.reminders as r}
          <div class="reminder-row">{r.name} — {r.next_due_date}</div>
        {:else}
          <p class="empty">Aucun rappel</p>
        {/each}
      </section>

      <section class="section">
        <h2>Historique médical</h2>
        {#each dossier.events as e}
          <div class="event-row">
            <span class="event-type">{e.type}</span>
            <span class="event-date">{new Date(e.occurred_at).toLocaleDateString('fr-FR')}</span>
          </div>
        {:else}
          <p class="empty">Aucun événement</p>
        {/each}
      </section>
    </div>

    <div class="disclaimer">Ce suivi est un outil d'aide. Consultez un vétérinaire pour toute décision médicale.</div>
  {:else}
    <p>Chargement...</p>
  {/if}
</div>

<style>
  .vet-dossier { max-width: 800px; margin: 0 auto; padding: var(--space-xl); }
  .error-page { text-align: center; padding: var(--space-3xl); }
  .portal-banner { background: var(--color-primary-soft); padding: var(--space-md) var(--space-lg); border-radius: var(--radius-lg); display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xl); }
  .banner-link { color: var(--color-primary); font-weight: 600; }
  .pet-identity { display: flex; gap: var(--space-lg); align-items: center; margin-bottom: var(--space-xl); }
  .pet-avatar { width: 80px; height: 80px; border-radius: 24px; background: linear-gradient(135deg, #ddd6fe, #a29bfe); display: flex; align-items: center; justify-content: center; font-size: 40px; }
  h1 { font-family: var(--font-display); }
  .chip { font-size: var(--text-xs); color: var(--color-text-muted); }
  .section { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-lg); margin-bottom: var(--space-lg); box-shadow: var(--elevation-sm); }
  h2 { font-size: var(--text-lg); margin-bottom: var(--space-md); }
  .reminder-row, .event-row { padding: var(--space-sm) 0; border-bottom: 1px solid var(--color-border); font-size: var(--text-sm); display: flex; justify-content: space-between; }
  .event-type { font-weight: 500; }
  .event-date { color: var(--color-text-muted); }
  .empty { color: var(--color-text-muted); font-size: var(--text-sm); }
  .disclaimer { font-size: var(--text-xs); color: var(--color-text-muted); text-align: center; padding: var(--space-xl) 0; border-top: 1px solid var(--color-border); margin-top: var(--space-xl); }
</style>
