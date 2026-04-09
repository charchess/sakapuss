<script lang="ts">
  let { data } = $props();

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
    });
  }

  function summarize(type: string, payload: Record<string, any>): string {
    switch (type) {
      case 'weight':
        return `${payload.value} ${payload.unit || 'kg'}`;
      case 'vaccine':
        return payload.name || '';
      case 'treatment':
        return payload.name || payload.text || '';
      case 'note':
        return payload.text || '';
      case 'litter':
        return payload.status || payload.text || '';
      case 'food':
        return payload.brand || payload.text || '';
      default:
        return JSON.stringify(payload);
    }
  }
</script>

<svelte:head>
  <title>{data.pet.name} — Consultation vétérinaire — Sakapuss</title>
</svelte:head>

<section class="vet-summary" data-testid="vet-summary">
  <a href="/pets/{data.pet.id}" class="back-link">← Retour au profil</a>

  <div class="vet-header">
    <h1>Résumé pour le vétérinaire</h1>
    <p class="pet-info">{data.pet.name} · {data.pet.species} · Né(e) le {data.pet.birth_date}</p>
  </div>

  <div class="vet-section">
    <h2>Historique récent (3 derniers mois)</h2>

    {#if data.events.length === 0}
      <p class="empty-state">Aucun événement enregistré sur cette période.</p>
    {:else}
      <table class="vet-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Détails</th>
          </tr>
        </thead>
        <tbody>
          {#each data.events as event}
            <tr>
              <td>{formatDate(event.occurred_at)}</td>
              <td>{EVENT_ICONS[event.type] || '📋'} {EVENT_LABELS[event.type] || event.type}</td>
              <td>{summarize(event.type, event.payload)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>

  {#if data.correlations.length > 0}
    <div class="vet-section">
      <h2>Alertes de corrélation</h2>
      {#each data.correlations as correl}
        <div class="alert-card">
          <span>⚠️</span>
          <p>Changement alimentaire suivi de symptômes digestifs ({correl.delay_hours}h après)</p>
        </div>
      {/each}
    </div>
  {/if}

  <div class="medical-disclaimer" data-testid="medical-disclaimer">
    <p>
      <strong>Avertissement :</strong> Sakapuss est un outil de suivi personnel. Il ne remplace pas
      un avis vétérinaire professionnel et ne constitue pas un dispositif médical. Les informations
      présentées ici sont fournies à titre indicatif uniquement. Consultez toujours un vétérinaire
      qualifié pour toute décision concernant la santé de votre animal.
    </p>
  </div>
</section>

<style>
  .vet-summary {
    max-width: 720px;
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

  .vet-header {
    margin-bottom: calc(var(--space-unit) * 4);
  }

  .vet-header h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: calc(var(--space-unit) / 2);
  }

  .pet-info {
    color: var(--color-neutral-500);
    font-size: 0.875rem;
  }

  .vet-section {
    margin-bottom: calc(var(--space-unit) * 4);
  }

  .vet-section h2 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: calc(var(--space-unit) * 2);
    color: var(--color-neutral-700);
  }

  .empty-state {
    background: white;
    border-radius: var(--radius);
    padding: calc(var(--space-unit) * 3);
    text-align: center;
    color: var(--color-neutral-500);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }

  .vet-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: var(--radius);
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }

  .vet-table th {
    text-align: left;
    padding: calc(var(--space-unit) * 1.5);
    background: var(--color-neutral-50);
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-neutral-500);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .vet-table td {
    padding: calc(var(--space-unit) * 1.5);
    font-size: 0.875rem;
    border-top: 1px solid var(--color-neutral-100);
    color: var(--color-neutral-700);
  }

  .alert-card {
    display: flex;
    gap: var(--space-unit);
    align-items: flex-start;
    background: #FFF7ED;
    border: 1px solid #FDBA74;
    border-radius: var(--radius);
    padding: calc(var(--space-unit) * 2);
    margin-bottom: var(--space-unit);
  }

  .alert-card p {
    font-size: 0.875rem;
    color: #92400E;
  }

  .medical-disclaimer {
    margin-top: calc(var(--space-unit) * 4);
    padding: calc(var(--space-unit) * 3);
    background: #FEF2F2;
    border: 1px solid #FECACA;
    border-radius: var(--radius);
  }

  .medical-disclaimer p {
    font-size: 0.8rem;
    color: #991B1B;
    line-height: 1.6;
  }
</style>
