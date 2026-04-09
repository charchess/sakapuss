<script lang="ts">
  import { getApiUrl } from '$lib/api';

  const API_URL = getApiUrl();

  const SPECIES_OPTIONS = [
    'Cat', 'Dog', 'Rabbit', 'Bird', 'Fish', 'Hamster', 'Guinea Pig', 'Turtle', 'Other'
  ];

  let { data } = $props();

  let name = $state(data.pet.name);
  let species = $state(data.pet.species);
  let birthDate = $state(data.pet.birth_date);
  let breed = $state(data.pet.breed || '');
  let sterilized = $state(data.pet.sterilized || false);
  let microchip = $state(data.pet.microchip || '');
  let vetName = $state(data.pet.vet_name || '');
  let vetPhone = $state(data.pet.vet_phone || '');
  let photoFile: File | null = $state(null);
  // Initialize preview with existing photo if any
  let photoPreview: string | null = $state(
    data.pet.photo_url ? `${API_URL.replace('/api', '')}${data.pet.photo_url}` : null
  );
  let submitting = $state(false);
  let error = $state('');

  function handlePhotoChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    photoFile = file;
    if (file) {
      photoPreview = URL.createObjectURL(file);
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
    body.sterilized = sterilized;
    if (microchip) body.microchip = microchip;
    if (vetName) body.vet_name = vetName;
    if (vetPhone) body.vet_phone = vetPhone;

    try {
      const res = await fetch(`${API_URL}/pets/${data.pet.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => null);
        error = d?.detail || `Erreur ${res.status}`;
        submitting = false;
        return;
      }

      if (photoFile) {
        const fd = new FormData();
        fd.append('file', photoFile);
        const photoRes = await fetch(`${API_URL}/pets/${data.pet.id}/photo`, {
          method: 'POST',
          body: fd,
        });
        if (!photoRes.ok) {
          console.warn('Photo upload failed:', photoRes.status);
        }
      }

      window.location.href = `/pets/${data.pet.id}`;
    } catch (err) {
      error = 'Erreur réseau';
      submitting = false;
    }
  }

  async function handleDelete() {
    if (!confirm('Supprimer cet animal ? Cette action est irréversible.')) return;

    try {
      const res = await fetch(`${API_URL}/pets/${data.pet.id}`, {
        method: 'DELETE',
      });

      if (res.ok || res.status === 204) {
        window.location.href = '/';
      } else {
        error = 'Erreur lors de la suppression';
      }
    } catch (err) {
      error = 'Erreur réseau';
    }
  }
</script>

<svelte:head>
  <title>Modifier {data.pet.name} — Sakapuss</title>
</svelte:head>

<section class="pet-form-page">
  <a href="/pets/{data.pet.id}" class="back-link">← Retour au profil</a>

  <h1>Modifier {data.pet.name}</h1>

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
      <label for="pet-species">Espèce *</label>
      <select id="pet-species" data-testid="pet-species" required bind:value={species}>
        <option value="" disabled>Choisir une espèce</option>
        {#each SPECIES_OPTIONS as sp}
          <option value={sp}>{sp}</option>
        {/each}
      </select>
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

    <div class="form-actions">
      <button type="submit" class="btn-submit" data-testid="pet-submit" disabled={submitting}>
        {submitting ? 'Enregistrement…' : 'Enregistrer'}
      </button>
      <button type="button" class="btn-delete" data-testid="pet-delete" onclick={handleDelete}>
        Supprimer
      </button>
    </div>
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

  .form-actions {
    display: flex;
    gap: calc(var(--space-unit) * 2);
    margin-top: var(--space-unit);
  }

  .btn-submit {
    flex: 1;
    padding: calc(var(--space-unit) * 1.5);
    min-height: 44px;
    background: var(--color-accent);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
  }

  .btn-submit:hover:not(:disabled) {
    background: #059669;
  }

  .btn-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-delete {
    padding: calc(var(--space-unit) * 1.5) calc(var(--space-unit) * 2);
    background: #FEF2F2;
    color: #991B1B;
    border: 1px solid #FECACA;
    border-radius: var(--radius-sm);
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
  }

  .btn-delete:hover {
    background: #FEE2E2;
  }
</style>
