<script lang="ts">
  import { getApiUrl } from '$lib/api';
  import { onMount } from 'svelte';

  interface ReminderItem {
    id: string;
    pet_id: string;
    type: string;
    name: string;
    next_due_date: string;
    frequency_days: number | null;
    product: string | null;
    last_done_date: string | null;
    status: string;
    pet_name: string | null;
  }

  let reminders = $state<ReminderItem[]>([]);
  let selectedReminder = $state<ReminderItem | null>(null);
  let showDetail = $state(false);
  let showPostpone = $state(false);
  let showSuccess = $state(false);
  let successMessage = $state('');

  const today = $derived(reminders.filter(r => r.status === 'today'));
  const overdue = $derived(reminders.filter(r => r.status === 'overdue'));
  const upcoming = $derived(reminders.filter(r => r.status === 'upcoming'));

  onMount(loadReminders);

  async function loadReminders() {
    const res = await fetch(`${getApiUrl()}/reminders/pending`);
    if (res.ok) {
      const pending = await res.json();
      const upRes = await fetch(`${getApiUrl()}/reminders/upcoming?days=90`);
      const upcomingList = upRes.ok ? await upRes.json() : [];
      // Merge and dedupe
      const all = [...pending, ...upcomingList];
      const seen = new Set<string>();
      reminders = all.filter(r => {
        if (seen.has(r.id)) return false;
        seen.add(r.id);
        return true;
      });
    }
  }

  function openDetail(r: ReminderItem) {
    selectedReminder = r;
    showDetail = true;
    showPostpone = false;
    showSuccess = false;
  }

  function closeDetail() {
    showDetail = false;
    selectedReminder = null;
  }

  async function complete() {
    if (!selectedReminder) return;
    const res = await fetch(`${getApiUrl()}/reminders/${selectedReminder.id}/complete`, { method: 'POST' });
    if (res.ok) {
      const updated = await res.json();
      showSuccess = true;
      successMessage = `${updated.name} ✓ — Prochain le ${updated.next_due_date}`;
      await loadReminders();
    }
  }

  async function postpone(days: number) {
    if (!selectedReminder) return;
    const res = await fetch(`${getApiUrl()}/reminders/${selectedReminder.id}/postpone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delay_days: days }),
    });
    if (res.ok) {
      closeDetail();
      await loadReminders();
    }
  }

  function statusColor(status: string): string {
    if (status === 'overdue') return 'var(--color-error)';
    if (status === 'today') return 'var(--color-warning)';
    return 'var(--color-text-muted)';
  }
</script>

<svelte:head><title>Rappels — Sakapuss</title></svelte:head>

<div class="reminders-page">
  <div class="page-header">
    <h1>Rappels</h1>
    {#if overdue.length > 0}
      <span class="overdue-badge" data-testid="overdue-badge">{overdue.length}</span>
    {/if}
  </div>

  {#if !showDetail}
    <!-- LIST VIEW -->
    {#if overdue.length > 0}
      <section class="segment overdue-segment">
        <h2 class="segment-title">En retard</h2>
        {#each overdue as r}
          <button class="reminder-card" onclick={() => openDetail(r)} data-testid="reminder-card">
            <div class="card-bar" style="background: var(--color-error)"></div>
            <div class="card-content">
              <div class="card-title">{r.name}</div>
              <div class="card-sub">{r.pet_name} · {r.next_due_date}</div>
            </div>
            <span class="chevron">›</span>
          </button>
        {/each}
      </section>
    {/if}

    {#if today.length > 0}
      <section class="segment">
        <h2 class="segment-title">Aujourd'hui</h2>
        {#each today as r}
          <button class="reminder-card" onclick={() => openDetail(r)} data-testid="reminder-card">
            <div class="card-bar" style="background: var(--color-warning)"></div>
            <div class="card-content">
              <div class="card-title">{r.name}</div>
              <div class="card-sub">{r.pet_name} · Aujourd'hui</div>
            </div>
            <span class="chevron">›</span>
          </button>
        {/each}
      </section>
    {/if}

    {#if upcoming.length > 0}
      <section class="segment">
        <h2 class="segment-title">À venir</h2>
        {#each upcoming as r}
          <button class="reminder-card" onclick={() => openDetail(r)} data-testid="reminder-card">
            <div class="card-bar" style="background: var(--color-text-muted)"></div>
            <div class="card-content">
              <div class="card-title">{r.name}</div>
              <div class="card-sub">{r.pet_name} · {r.next_due_date}</div>
            </div>
            <span class="chevron">›</span>
          </button>
        {/each}
      </section>
    {/if}

    {#if reminders.length === 0}
      <div class="empty">
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="36" fill="var(--color-primary-soft)"/>
          <path d="M40 18a6 6 0 00-6 6v2a14 14 0 00-8 12.5V44l-4 4h36l-4-4v-5.5A14 14 0 0046 26v-2a6 6 0 00-6-6z" fill="var(--color-primary-light)" stroke="var(--color-primary)" stroke-width="1.5"/>
          <path d="M36 48a4 4 0 008 0" stroke="var(--color-primary)" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <p>Aucun rappel configuré</p>
        <span class="empty-hint">Les rappels sont créés automatiquement lors d'un vaccin ou traitement</span>
      </div>
    {/if}

  {:else}
    <!-- DETAIL VIEW -->
    <button class="back-btn" onclick={closeDetail}>← Retour</button>

    {#if showSuccess}
      <div class="success-state" data-testid="reminder-success">
        <div class="success-icon">✓</div>
        <div class="success-text">{successMessage}</div>
        <button class="btn-secondary" onclick={closeDetail}>Retour aux rappels</button>
      </div>
    {:else if selectedReminder}
      <div class="detail-card">
        <div class="animal-context">
          <div class="animal-avatar">🐱</div>
          <div class="animal-speech">
            <strong>{selectedReminder.pet_name}</strong>
            <em>"{selectedReminder.name}, c'est le moment !"</em>
          </div>
        </div>

        <div class="info-card">
          <div class="info-row"><span class="info-label">Type</span><span>{selectedReminder.type}</span></div>
          <div class="info-row"><span class="info-label">Date</span><span style="color: {statusColor(selectedReminder.status)}">{selectedReminder.next_due_date}</span></div>
          {#if selectedReminder.product}<div class="info-row"><span class="info-label">Produit</span><span>{selectedReminder.product}</span></div>{/if}
          {#if selectedReminder.last_done_date}<div class="info-row"><span class="info-label">Dernier</span><span>{selectedReminder.last_done_date}</span></div>{/if}
          {#if selectedReminder.frequency_days}<div class="info-row"><span class="info-label">Fréquence</span><span>Tous les {selectedReminder.frequency_days} jours</span></div>{/if}
        </div>

        <div class="actions">
          <button class="btn-done" onclick={complete} data-testid="btn-done">C'est fait ✓</button>
          <button class="btn-postpone" onclick={() => showPostpone = !showPostpone} data-testid="btn-postpone">Reporter</button>
          {#if showPostpone}
            <div class="postpone-chips">
              <button class="chip" onclick={() => postpone(3)}>+3 jours</button>
              <button class="chip" onclick={() => postpone(7)}>+1 semaine</button>
              <button class="chip" onclick={() => postpone(14)}>+2 semaines</button>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .reminders-page { padding: 52px var(--space-lg) var(--space-lg); max-width: 500px; margin: 0 auto; }
  .page-header { display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-xl); }
  h1 { font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 800; color: var(--color-primary); }
  .overdue-badge {
    background: var(--color-error);
    color: white;
    font-size: 12px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: var(--radius-full);
  }
  .segment { margin-bottom: var(--space-xl); }
  .segment-title { font-size: var(--text-sm); font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: var(--space-sm); }
  .overdue-segment .segment-title { color: var(--color-error); }

  .reminder-card {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    background: var(--color-surface);
    border: none;
    border-radius: var(--radius-lg);
    padding: var(--space-md) var(--space-lg);
    margin-bottom: var(--space-sm);
    width: 100%;
    text-align: left;
    cursor: pointer;
    box-shadow: var(--elevation-sm);
    transition: transform 0.15s;
    font-family: var(--font-default);
  }
  .reminder-card:active { transform: scale(0.98); }
  .card-bar { width: 4px; height: 40px; border-radius: 2px; flex-shrink: 0; }
  .card-content { flex: 1; }
  .card-title { font-size: var(--text-md); font-weight: 600; color: var(--color-text-primary); }
  .card-sub { font-size: var(--text-xs); color: var(--color-text-secondary); margin-top: 2px; }
  .chevron { color: var(--color-text-muted); font-size: 20px; }
  .empty {
    text-align: center;
    padding: var(--space-3xl) var(--space-xl);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
  }
  .empty svg { width: 80px; height: 80px; }
  .empty p { font-size: var(--text-md); font-weight: 500; color: var(--color-text-secondary); }
  .empty-hint { font-size: var(--text-sm); color: var(--color-text-muted); max-width: 280px; }

  /* Detail view */
  .back-btn { background: none; border: none; color: var(--color-primary); font-size: var(--text-md); cursor: pointer; margin-bottom: var(--space-lg); font-family: var(--font-default); }
  .detail-card { display: flex; flex-direction: column; gap: var(--space-lg); }
  .animal-context { display: flex; gap: var(--space-md); align-items: flex-start; }
  .animal-avatar { width: 56px; height: 56px; border-radius: 18px; background: linear-gradient(135deg, #ddd6fe, #a29bfe); display: flex; align-items: center; justify-content: center; font-size: 30px; }
  .animal-speech em { display: block; font-size: var(--text-sm); color: var(--color-text-secondary); margin-top: 2px; }
  .info-card { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-lg); box-shadow: var(--elevation-sm); }
  .info-row { display: flex; justify-content: space-between; padding: var(--space-sm) 0; border-bottom: 1px solid var(--color-border); font-size: var(--text-sm); }
  .info-row:last-child { border-bottom: none; }
  .info-label { color: var(--color-text-muted); }
  .actions { display: flex; flex-direction: column; gap: var(--space-sm); }
  .btn-done { width: 100%; padding: var(--space-lg); background: linear-gradient(135deg, #00b894, #00cec9); color: white; border: none; border-radius: var(--radius-lg); font-size: var(--text-md); font-weight: 600; cursor: pointer; font-family: var(--font-default); }
  .btn-done:active { transform: scale(0.98); }
  .btn-postpone { width: 100%; padding: var(--space-md); background: var(--color-bg); color: var(--color-text-secondary); border: 1.5px solid var(--color-border); border-radius: var(--radius-lg); font-size: var(--text-md); cursor: pointer; font-family: var(--font-default); }
  .postpone-chips { display: flex; gap: var(--space-sm); margin-top: var(--space-sm); }
  .chip { flex: 1; padding: var(--space-sm); background: rgba(253,203,110,0.15); border: none; border-radius: var(--radius-full); font-size: var(--text-sm); color: var(--color-text-primary); cursor: pointer; font-family: var(--font-default); }
  .chip:active { background: var(--color-primary-soft); }

  /* Success state */
  .success-state { text-align: center; padding: var(--space-3xl) var(--space-lg); }
  .success-icon { font-size: 64px; margin-bottom: var(--space-lg); }
  .success-text { font-family: var(--font-display); font-size: var(--text-xl); font-weight: 700; color: var(--color-success); margin-bottom: var(--space-xl); }
  .btn-secondary { padding: var(--space-md) var(--space-xl); background: var(--color-bg); border: 1.5px solid var(--color-border); border-radius: var(--radius-lg); font-size: var(--text-md); cursor: pointer; font-family: var(--font-default); }
</style>
