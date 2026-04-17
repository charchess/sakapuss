<script lang="ts">
  import { onMount } from 'svelte';
  import { getApiUrl } from '$lib/api';

  interface Patient {
    id: string;
    name: string;
    species: string;
    breed: string | null;
    hasAlert?: boolean;
    alertText?: string;
  }

  let searchQuery = $state('');
  let patients = $state<Patient[]>([]);
  let loading = $state(true);
  let searchEl = $state<HTMLInputElement | null>(null);

  const filtered = $derived(
    patients.filter(p =>
      !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const patientsWithAlerts = $derived(filtered.filter(p => p.hasAlert));
  const recentPatients = $derived(filtered.slice(0, 10));

  function authHdr(): Record<string, string> {
    const t = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    return t ? { Authorization: `Bearer ${t}` } : {};
  }

  onMount(async () => {
    const res = await fetch(`${getApiUrl()}/vet/patients`, { headers: authHdr() });
    if (res.ok) {
      const rawPatients: Patient[] = await res.json();
      // Check anomalies for each patient
      const withAlerts = await Promise.all(
        rawPatients.map(async (p) => {
          try {
            const anomRes = await fetch(`${getApiUrl()}/pets/${p.id}/anomalies`, { headers: authHdr() });
            const anomalies = anomRes.ok ? await anomRes.json() : [];
            if (anomalies.length > 0) {
              return { ...p, hasAlert: true, alertText: anomalies[0]?.description || 'Perte de poids détectée' };
            }
          } catch {}
          return p;
        })
      );
      patients = withAlerts;
    }
    loading = false;
    // Auto-focus search bar
    if (searchEl) searchEl.focus();
  });
</script>

<svelte:head><title>Patients — Sakapuss Vétérinaire</title></svelte:head>

<div class="vet-dashboard">
  <div class="dashboard-header">
    <h1>Mes patients</h1>
  </div>

  <!-- Search bar -->
  <div class="search-container">
    <input
      type="search"
      aria-label="Rechercher un patient"
      placeholder="Rechercher un patient…"
      bind:value={searchQuery}
      bind:this={searchEl}
      class="search-input"
      data-testid="vet-search"
    />
  </div>

  {#if loading}
    <div class="loading">Chargement…</div>
  {:else}

    <!-- Patients with alerts -->
    <section class="patients-section" data-testid="patients-with-alerts">
      <h2>Alertes actives</h2>
      {#if patientsWithAlerts.length === 0}
        <div class="empty-section">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span>Aucune alerte — tous les patients sont stables</span>
        </div>
      {:else}
        <div class="patient-grid">
          {#each patientsWithAlerts as patient}
            <a href="/vet/patients/{patient.id}" class="patient-card" data-testid="patient-card">
              <div class="patient-avatar">
                {patient.species?.toLowerCase().includes('cat') || patient.species?.toLowerCase().includes('chat') ? '🐱' :
                 patient.species?.toLowerCase().includes('dog') || patient.species?.toLowerCase().includes('chien') ? '🐶' : '🐾'}
              </div>
              <div class="patient-info">
                <strong class="patient-name">{patient.name}</strong>
                {#if patient.breed}<span class="patient-breed">{patient.breed}</span>{/if}
              </div>
              {#if patient.alertText}
                <span class="alert-chip">⚠ {patient.alertText}</span>
              {/if}
            </a>
          {/each}
        </div>
      {/if}
    </section>

    <!-- Recent patients -->
    <section class="patients-section" data-testid="recent-patients">
      <h2>Tous les patients</h2>
      {#if recentPatients.length === 0}
        <div class="empty-section">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span>Aucun patient pour le moment</span>
        </div>
      {:else}
        <div class="patient-grid">
          {#each recentPatients as patient}
            <a href="/vet/patients/{patient.id}" class="patient-card" data-testid="patient-card">
              <div class="patient-avatar">
                {patient.species?.toLowerCase().includes('cat') || patient.species?.toLowerCase().includes('chat') ? '🐱' :
                 patient.species?.toLowerCase().includes('dog') || patient.species?.toLowerCase().includes('chien') ? '🐶' : '🐾'}
              </div>
              <div class="patient-info">
                <strong class="patient-name">{patient.name}</strong>
                {#if patient.breed}<span class="patient-breed">{patient.breed}</span>{/if}
              </div>
            </a>
          {/each}
        </div>
      {/if}
    </section>

  {/if}
</div>

<style>
  .vet-dashboard { padding: 52px var(--space-lg) var(--space-lg); max-width: 960px; }
  .dashboard-header h1 {
    font-family: var(--font-display); font-size: var(--text-2xl);
    font-weight: 800; color: var(--color-primary); margin-bottom: var(--space-xl);
  }

  .search-container { margin-bottom: var(--space-2xl); }
  .search-input {
    width: 100%; padding: var(--space-lg); font-size: var(--text-lg);
    border: 2px solid var(--color-border); border-radius: var(--radius-xl);
    font-family: var(--font-default); background: var(--color-surface);
    color: var(--color-text-primary);
    box-shadow: var(--elevation-sm);
  }
  .search-input:focus {
    outline: none; border-color: var(--color-primary);
    box-shadow: 0 0 0 3px var(--color-primary-soft);
  }

  .patients-section { margin-bottom: var(--space-2xl); }
  .patients-section h2 {
    font-family: var(--font-display); font-size: var(--text-md); font-weight: 700;
    color: var(--color-text-primary); margin-bottom: var(--space-md);
  }

  .patient-grid { display: flex; flex-direction: column; gap: var(--space-sm); }

  .patient-card {
    display: flex; align-items: center; gap: var(--space-md);
    background: var(--color-surface); border-radius: var(--radius-xl);
    padding: var(--space-md) var(--space-lg); box-shadow: var(--elevation-sm);
    text-decoration: none; color: inherit; cursor: pointer; transition: transform 0.15s;
  }
  .patient-card:hover { transform: translateX(2px); }

  .patient-avatar { font-size: 28px; width: 44px; text-align: center; flex-shrink: 0; }
  .patient-info { flex: 1; }
  .patient-name { display: block; font-size: var(--text-md); font-weight: 600; color: var(--color-text-primary); }
  .patient-breed { font-size: var(--text-xs); color: var(--color-text-muted); }

  .alert-chip {
    font-size: var(--text-xs); padding: 2px var(--space-sm);
    background: rgba(225,112,85,0.1); color: var(--color-error);
    border-radius: var(--radius-full); flex-shrink: 0;
  }

  .empty-section {
    display: flex; align-items: center; gap: var(--space-sm);
    font-size: var(--text-sm); color: var(--color-text-muted);
    padding: var(--space-md) var(--space-sm);
    background: var(--color-primary-soft); border-radius: var(--radius-lg);
  }
  .empty-icon { width: 18px; height: 18px; flex-shrink: 0; }
  .loading { text-align: center; padding: var(--space-3xl); color: var(--color-text-muted); }
</style>
