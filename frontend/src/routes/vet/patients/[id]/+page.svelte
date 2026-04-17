<script lang="ts">
  import { onMount } from 'svelte';
  import { getApiUrl } from '$lib/api';
  import { page } from '$app/stores';

  const petId = $derived($page.params.id);

  interface PetEvent {
    id: string;
    type: string;
    occurred_at: string;
    payload: any;
  }

  interface Alert {
    type: string;
    message?: string;
    description?: string;
  }

  let petName = $state('');
  let petSpecies = $state('');
  let events = $state<PetEvent[]>([]);
  let anomalies = $state<Alert[]>([]);
  let reminders = $state<any[]>([]);
  let timelineFilter = $state<'medical' | 'all'>('medical');

  const TYPE_LABELS: Record<string, string> = {
    weight: 'Poids', vaccine: 'Vaccin', treatment: 'Traitement',
    medicine: 'Médicament', health_note: 'Note santé', litter_clean: 'Litière',
    food_serve: 'Repas', behavior: 'Comportement', observation: 'Observation', note: 'Note',
  };

  const medicalTypes = ['weight', 'vaccine', 'treatment', 'medicine', 'health_note'];

  const filteredEvents = $derived(
    timelineFilter === 'medical'
      ? events.filter(e => medicalTypes.some(t => e.type.includes(t)))
      : events
  );

  // Alerts from anomalies + overdue reminders
  const allAlerts = $derived.by(() => {
    const alerts: { text: string }[] = [];
    for (const a of anomalies) {
      alerts.push({ text: a.description || 'Perte de poids détectée' });
    }
    const now = new Date();
    for (const r of reminders) {
      if (r.next_due_date && new Date(r.next_due_date) < now) {
        alerts.push({ text: `Traitement en retard: ${r.name}` });
      }
    }
    return alerts;
  });

  function authHdr(): Record<string, string> {
    const t = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    return t ? { Authorization: `Bearer ${t}` } : {};
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function getTypeLabel(type: string): string {
    return TYPE_LABELS[type] || type.replace(/_/g, ' ');
  }

  onMount(async () => {
    const id = petId;
    const [petRes, eventsRes, anomaliesRes, remindersRes] = await Promise.all([
      fetch(`${getApiUrl()}/pets/${id}`, { headers: authHdr() }),
      fetch(`${getApiUrl()}/pets/${id}/events`, { headers: authHdr() }),
      fetch(`${getApiUrl()}/pets/${id}/anomalies`, { headers: authHdr() }).catch(() => null),
      fetch(`${getApiUrl()}/pets/${id}/reminders`, { headers: authHdr() }).catch(() => null),
    ]);

    if (petRes.ok) {
      const pet = await petRes.json();
      petName = pet.name;
      petSpecies = pet.species;
    }
    if (eventsRes.ok) events = await eventsRes.json();
    if (anomaliesRes?.ok) anomalies = await anomaliesRes.json();
    if (remindersRes?.ok) reminders = await remindersRes.json();
  });
</script>

<svelte:head><title>{petName || 'Patient'} — Dossier vétérinaire</title></svelte:head>

<div class="vet-patient-page">
  <a href="/vet/dashboard" class="back-link">← Dashboard</a>

  <div class="dossier-layout">
    <!-- Left column: patient info + alerts -->
    <aside class="dossier-left" data-testid="vet-dossier-left-column">
      <div class="patient-header">
        <div class="patient-avatar">
          {petSpecies?.toLowerCase().includes('cat') || petSpecies?.toLowerCase().includes('chat') ? '🐱' :
           petSpecies?.toLowerCase().includes('dog') || petSpecies?.toLowerCase().includes('chien') ? '🐶' : '🐾'}
        </div>
        <div>
          <h1 class="patient-name">{petName}</h1>
          <span class="patient-species">{petSpecies}</span>
        </div>
      </div>

      <!-- Alert cards -->
      {#each allAlerts as alert}
        <div class="alert-card" data-testid="vet-alert-card">
          <span class="alert-icon">⚠</span>
          <span class="alert-text">{alert.text}</span>
        </div>
      {/each}

      <!-- Reminders summary -->
      {#if reminders.length > 0}
        <div class="reminders-summary">
          <h3>Rappels</h3>
          {#each reminders.slice(0, 5) as reminder}
            <div class="reminder-item">
              <span class="reminder-name">{reminder.name}</span>
              <span class="reminder-date">{formatDate(reminder.next_due_date)}</span>
            </div>
          {/each}
        </div>
      {/if}
    </aside>

    <!-- Right column: timeline -->
    <main class="dossier-right" data-testid="vet-dossier-right-column">
      <!-- Filter bar -->
      <div class="timeline-filter-bar" data-testid="vet-timeline-filter">
        <button
          class="filter-btn"
          class:active={timelineFilter === 'medical'}
          aria-pressed={timelineFilter === 'medical'}
          onclick={() => timelineFilter = 'medical'}
        >Médical</button>
        <button
          class="filter-btn show-all"
          aria-label="Tout afficher"
          onclick={() => timelineFilter = 'all'}
        >Tout afficher</button>
      </div>

      <!-- Timeline -->
      <div class="vet-timeline" data-testid="vet-timeline">
        {#each filteredEvents.slice(0, 20) as event}
          <div class="timeline-event" data-testid="timeline-event">
            <div class="event-dot"></div>
            <div class="event-content">
              <strong class="event-type">{getTypeLabel(event.type)}</strong>
              {#if event.payload?.value != null}
                <span class="event-value">{event.payload.value}{event.payload.unit ? ` ${event.payload.unit}` : ''}</span>
              {/if}
              <div class="event-date">{formatDate(event.occurred_at)}</div>
            </div>
          </div>
        {/each}

        {#if filteredEvents.length === 0}
          <div class="empty-timeline">Aucun événement médical enregistré</div>
        {/if}
      </div>
    </main>
  </div>
</div>

<style>
  .vet-patient-page { padding: 52px var(--space-lg) var(--space-lg); max-width: 1000px; }

  .back-link {
    display: inline-block; color: var(--color-primary);
    font-size: var(--text-sm); margin-bottom: var(--space-xl);
    text-decoration: none;
  }
  .back-link:hover { text-decoration: underline; }

  .dossier-layout {
    display: grid; grid-template-columns: 280px 1fr;
    gap: var(--space-xl); align-items: start;
  }

  /* Left column */
  .dossier-left {
    display: flex; flex-direction: column; gap: var(--space-lg);
    position: sticky; top: var(--space-xl);
  }
  .patient-header { display: flex; gap: var(--space-md); align-items: center; }
  .patient-avatar { font-size: 36px; }
  .patient-name {
    font-family: var(--font-display); font-size: var(--text-xl);
    font-weight: 800; color: var(--color-primary); margin: 0;
  }
  .patient-species { font-size: var(--text-sm); color: var(--color-text-muted); }

  .alert-card {
    display: flex; align-items: flex-start; gap: var(--space-sm);
    background: rgba(225,112,85,0.08); border: 1.5px solid var(--color-error);
    border-radius: var(--radius-lg); padding: var(--space-md);
  }
  .alert-icon { color: var(--color-error); font-size: 14px; flex-shrink: 0; }
  .alert-text { font-size: var(--text-sm); color: var(--color-error); font-weight: 500; }

  .reminders-summary {
    background: var(--color-surface); border-radius: var(--radius-xl);
    padding: var(--space-lg); box-shadow: var(--elevation-sm);
  }
  .reminders-summary h3 {
    font-size: var(--text-sm); font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.5px; color: var(--color-text-muted); margin-bottom: var(--space-md);
  }
  .reminder-item {
    display: flex; justify-content: space-between; padding: var(--space-xs) 0;
    border-bottom: 1px solid var(--color-border); font-size: var(--text-sm);
  }
  .reminder-item:last-child { border-bottom: none; }
  .reminder-name { color: var(--color-text-primary); }
  .reminder-date { color: var(--color-text-muted); }

  /* Right column */
  .dossier-right { min-width: 0; }

  .timeline-filter-bar {
    display: flex; gap: var(--space-sm); margin-bottom: var(--space-xl);
    border-bottom: 2px solid var(--color-border); padding-bottom: var(--space-md);
  }
  .filter-btn {
    padding: var(--space-sm) var(--space-md); border: none; background: none;
    font-size: var(--text-sm); cursor: pointer; font-family: var(--font-default);
    color: var(--color-text-muted); border-radius: var(--radius-md);
  }
  .filter-btn.active, .filter-btn[aria-pressed="true"] {
    background: var(--color-primary-soft); color: var(--color-primary); font-weight: 600;
  }
  .show-all { margin-left: auto; }

  .vet-timeline { display: flex; flex-direction: column; gap: var(--space-md); }
  .timeline-event { display: flex; gap: var(--space-md); }
  .event-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--color-primary); flex-shrink: 0; margin-top: 5px;
  }
  .event-content { flex: 1; }
  .event-type { font-size: var(--text-sm); font-weight: 600; color: var(--color-text-primary); }
  .event-value { font-size: var(--text-sm); color: var(--color-primary); font-weight: 600; margin-left: var(--space-xs); }
  .event-date { font-size: var(--text-xs); color: var(--color-text-muted); margin-top: 2px; }

  .empty-timeline { font-size: var(--text-sm); color: var(--color-text-muted); padding: var(--space-xl) 0; }

  @media (max-width: 640px) {
    .dossier-layout { grid-template-columns: 1fr; }
    .dossier-left { position: static; }
  }
</style>
