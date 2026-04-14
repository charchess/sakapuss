<script lang="ts">
  import { getApiUrl } from '$lib/api';

  const API_URL = getApiUrl();

  const SPECIES_OPTIONS = [
    { value: 'Cat', label: 'Chat', emoji: '🐱' },
    { value: 'Dog', label: 'Chien', emoji: '🐶' },
    { value: 'Rabbit', label: 'Lapin', emoji: '🐰' },
    { value: 'Other', label: 'Autre', emoji: '🐾' },
  ];

  let name = $state('');
  let species = $state('');
  let birthDate = $state('');
  let breed = $state('');
  let sterilized = $state(false);
  let microchip = $state('');
  let vetName = $state('');
  let vetPhone = $state('');
  let photoFile: File | null = $state(null);
  let photoPreview: string | null = $state(null);
  let submitting = $state(false);
  let error = $state('');

  function handlePhotoChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    photoFile = file;
    if (file) {
      photoPreview = URL.createObjectURL(file);
    } else {
      photoPreview = null;
    }
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (submitting) return;
    submitting = true;
    error = '';

    const body: Record<string, unknown> = {
      name,
      species,
      birth_date: birthDate,
    };
    if (breed) body.breed = breed;
    if (sterilized) body.sterilized = true;
    if (microchip) body.microchip = microchip;
    if (vetName) body.vet_name = vetName;
    if (vetPhone) body.vet_phone = vetPhone;

    try {
      const res = await fetch(`${API_URL}/pets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        error = data?.detail || `Erreur ${res.status}`;
        submitting = false;
        return;
      }

      const created = await res.json();

      if (photoFile) {
        const fd = new FormData();
        fd.append('file', photoFile);
        const photoRes = await fetch(`${API_URL}/pets/${created.id}/photo`, {
          method: 'POST',
          body: fd,
        });
        if (!photoRes.ok) {
          // Pet created but photo failed — non-blocking, redirect anyway
          console.warn('Photo upload failed:', photoRes.status);
        }
      }

      window.location.href = '/';
    } catch (err) {
      error = 'Erreur réseau';
      submitting = false;
    }
  }
</script>

<svelte:head>
  <title>Nouvel animal — Sakapuss</title>
</svelte:head>

<section class="pet-form-page">
  <a href="/" class="back-link">← Retour au dashboard</a>

  <h1>Ajouter un animal</h1>

  {#if error}
    <div class="form-error">{error}</div>
  {/if}

  <form onsubmit={handleSubmit}>
    <div class="form-group">
      <label for="pet-photo">Photo de profil</label>
      <input
        id="pet-photo"
        data-testid="pet-photo-input"
        type="file"
        accept="image/*"
        onchange={handlePhotoChange}
      />
      {#if photoPreview}
        <img
          src={photoPreview}
          alt="Aperçu de la photo"
          data-testid="pet-photo-preview"
          class="photo-preview"
        />
      {/if}
    </div>

    <div class="form-group">
      <label for="pet-name">Nom *</label>
      <input id="pet-name" data-testid="pet-name" type="text" required bind:value={name} />
    </div>

    <div class="form-group">
      <label>Espèce *</label>
      <div class="species-grid" data-testid="pet-species">
        {#each SPECIES_OPTIONS as sp}
          <button
            type="button"
            class="species-btn"
            class:active={species === sp.value}
            onclick={() => species = sp.value}
          >
            <span class="species-emoji">{sp.emoji}</span>
            <span class="species-label">{sp.label}</span>
          </button>
        {/each}
      </div>
    </div>

    <div class="form-group">
      <label for="pet-birth-date">Date de naissance *</label>
      <input id="pet-birth-date" data-testid="pet-birth-date" type="date" required bind:value={birthDate} />
    </div>

    <div class="form-group">
      <label for="pet-breed">Race</label>
      <input id="pet-breed" data-testid="pet-breed" type="text" bind:value={breed} />
    </div>

    <div class="form-group checkbox-group">
      <label>
        <input data-testid="pet-sterilized" type="checkbox" bind:checked={sterilized} />
        Stérilisé(e)
      </label>
    </div>

    <div class="form-group">
      <label for="pet-microchip">N° puce</label>
      <input id="pet-microchip" data-testid="pet-microchip" type="text" bind:value={microchip} />
    </div>

    <div class="form-group">
      <label for="pet-vet-name">Nom du vétérinaire</label>
      <input id="pet-vet-name" data-testid="pet-vet-name" type="text" bind:value={vetName} />
    </div>

    <div class="form-group">
      <label for="pet-vet-phone">Téléphone du vétérinaire</label>
      <input id="pet-vet-phone" data-testid="pet-vet-phone" type="text" bind:value={vetPhone} />
    </div>

    <button type="submit" class="btn-submit" data-testid="pet-submit" disabled={submitting}>
      {submitting ? 'Enregistrement…' : 'Créer l\'animal'}
    </button>
  </form>
</section>

<style>
  .pet-form-page {
    max-width: 540px;
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

  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: calc(var(--space-unit) * 3);
    color: var(--color-neutral-900);
  }

  .form-error {
    background: #FEF2F2;
    border: 1px solid #FECACA;
    border-radius: var(--radius-sm);
    padding: calc(var(--space-unit) * 1.5);
    color: #991B1B;
    font-size: 0.875rem;
    margin-bottom: calc(var(--space-unit) * 2);
  }

  form {
    display: flex;
    flex-direction: column;
    gap: calc(var(--space-unit) * 2);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: calc(var(--space-unit) / 2);
  }

  .form-group label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-neutral-700);
  }

  .form-group input[type='text'],
  .form-group input[type='date'],
  .form-group select {
    padding: calc(var(--space-unit) * 1.5);
    border: 2px solid var(--color-neutral-200);
    border-radius: var(--radius-sm);
    font-size: 1rem;
    background: white;
  }

  .form-group input:focus,
  .form-group select:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  .photo-preview {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: var(--radius-sm);
    margin-top: var(--space-unit);
    border: 2px solid var(--color-neutral-200);
  }

  .checkbox-group {
    flex-direction: row;
    align-items: center;
  }

  .checkbox-group label {
    display: flex;
    align-items: center;
    gap: var(--space-unit);
    cursor: pointer;
  }

  .checkbox-group input[type='checkbox'] {
    width: 18px;
    height: 18px;
    accent-color: var(--color-accent);
  }

  .btn-submit {
    padding: calc(var(--space-unit) * 1.5);
    min-height: 44px;
    background: var(--color-accent);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    margin-top: var(--space-unit);
  }

  .btn-submit:hover:not(:disabled) {
    background: #059669;
  }

  .btn-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .species-grid { display: flex; gap: var(--space-sm); }
  .species-btn {
    flex: 1; display: flex; flex-direction: column; align-items: center; gap: var(--space-xs);
    padding: var(--space-md); border: 2px solid var(--color-border, #EDE9FE);
    border-radius: 16px; background: white; cursor: pointer;
    transition: all 0.2s; font-family: inherit;
  }
  .species-btn.active {
    border-color: var(--color-primary, #6C5CE7);
    background: rgba(108, 92, 231, 0.06);
    box-shadow: 0 2px 12px rgba(108, 92, 231, 0.15);
  }
  .species-btn:active { transform: scale(0.95); }
  .species-emoji { font-size: 28px; }
  .species-label { font-size: 12px; font-weight: 500; color: #636E72; }
  .species-btn.active .species-label { color: var(--color-primary, #6C5CE7); font-weight: 600; }
</style>
