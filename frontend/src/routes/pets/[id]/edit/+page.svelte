<script lang="ts">
  import { getApiUrl } from '$lib/api';

  const API_URL = getApiUrl();

  const SPECIES_OPTIONS = [
    { value: 'Cat',    label: 'Chat',  emoji: '🐱' },
    { value: 'Dog',    label: 'Chien', emoji: '🐶' },
    { value: 'Rabbit', label: 'Lapin', emoji: '🐰' },
    { value: 'Other',  label: 'Autre', emoji: '🐾' },
  ];

  let { data } = $props();

  let name       = $state(data.pet.name);
  let species    = $state(data.pet.species);
  let birthDate  = $state(data.pet.birth_date ?? '');
  let breed      = $state(data.pet.breed ?? '');
  let sterilized = $state(data.pet.sterilized ?? false);
  let microchip  = $state(data.pet.microchip ?? '');
  let vetName    = $state(data.pet.vet_name ?? '');
  let vetPhone   = $state(data.pet.vet_phone ?? '');
  let photoFile: File | null = $state(null);
  let photoPreview: string | null = $state(
    data.pet.photo_url ? `${getApiUrl().replace('/api', '')}${data.pet.photo_url}` : null
  );
  let submitting = $state(false);
  let error = $state('');

  function getToken(): string | null {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  }

  function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
    const token = getToken();
    return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...extra };
  }

  function handlePhotoChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    photoFile = file;
    photoPreview = file ? URL.createObjectURL(file) : photoPreview;
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (submitting) return;
    submitting = true;
    error = '';

    const body: Record<string, unknown> = { name, species, birth_date: birthDate };
    if (breed) body.breed = breed;
    body.sterilized = sterilized;
    if (microchip) body.microchip = microchip;
    if (vetName)   body.vet_name = vetName;
    if (vetPhone)  body.vet_phone = vetPhone;

    try {
      const res = await fetch(`${API_URL}/pets/${data.pet.id}`, {
        method: 'PUT',
        headers: authHeaders(),
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
        const token = getToken();
        await fetch(`${API_URL}/pets/${data.pet.id}/photo`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd,
        });
      }

      window.location.href = `/pets/${data.pet.id}`;
    } catch {
      error = 'Erreur réseau';
      submitting = false;
    }
  }

  async function handleDelete() {
    if (!confirm('Supprimer cet animal ? Cette action est irréversible.')) return;
    try {
      const res = await fetch(`${API_URL}/pets/${data.pet.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (res.ok || res.status === 204) {
        window.location.href = '/';
      } else {
        error = 'Erreur lors de la suppression';
      }
    } catch {
      error = 'Erreur réseau';
    }
  }
</script>

<svelte:head><title>Modifier {data.pet.name} — Sakapuss</title></svelte:head>

<section class="pet-form-page">
  <a href="/pets/{data.pet.id}" class="back-link">← Retour au profil</a>
  <h1>Modifier {data.pet.name}</h1>

  {#if error}<div class="form-error">{error}</div>{/if}

  <form onsubmit={handleSubmit}>

    <!-- Photo -->
    <div class="form-group">
      <label>Photo de profil</label>
      <label class="photo-upload" class:has-preview={!!photoPreview} for="pet-photo-edit">
        {#if photoPreview}
          <img src={photoPreview} alt="Aperçu" data-testid="pet-photo-preview" class="photo-preview-img" />
          <span class="photo-change">Changer</span>
        {:else}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>
          </svg>
          <span>Ajouter une photo</span>
        {/if}
      </label>
      <input
        id="pet-photo-edit"
        data-testid="pet-photo-input"
        type="file"
        accept="image/*"
        onchange={handlePhotoChange}
        class="photo-input-hidden"
      />
    </div>

    <!-- Nom -->
    <div class="form-group">
      <label for="pet-name">Nom *</label>
      <input id="pet-name" data-testid="pet-name" type="text" required bind:value={name} />
    </div>

    <!-- Espèce — card selector -->
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

    <!-- Date de naissance -->
    <div class="form-group">
      <label for="pet-birth-date">Date de naissance *</label>
      <input id="pet-birth-date" data-testid="pet-birth-date" type="date" required bind:value={birthDate} lang="fr" />
    </div>

    <!-- Race -->
    <div class="form-group">
      <label for="pet-breed">Race</label>
      <input id="pet-breed" data-testid="pet-breed" type="text" bind:value={breed} />
    </div>

    <!-- Stérilisé -->
    <div class="form-group checkbox-group">
      <label>
        <input data-testid="pet-sterilized" type="checkbox" bind:checked={sterilized} />
        Stérilisé(e)
      </label>
    </div>

    <!-- Puce -->
    <div class="form-group">
      <label for="pet-microchip">N° puce</label>
      <input id="pet-microchip" data-testid="pet-microchip" type="text" bind:value={microchip} />
    </div>

    <!-- Vétérinaire -->
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
  .pet-form-page { max-width: 540px; padding: 52px var(--space-lg) var(--space-lg); }

  .back-link {
    display: inline-block; color: var(--color-primary);
    font-size: var(--text-sm); margin-bottom: var(--space-xl);
  }
  .back-link:hover { text-decoration: underline; }

  h1 {
    font-family: var(--font-display); font-size: var(--text-2xl);
    font-weight: 800; margin-bottom: var(--space-xl); color: var(--color-primary);
  }

  .form-error {
    background: rgba(225,112,85,0.08); border: 1px solid rgba(225,112,85,0.3);
    border-radius: var(--radius-md); padding: var(--space-md);
    color: var(--color-error); font-size: var(--text-sm); margin-bottom: var(--space-md);
  }

  form { display: flex; flex-direction: column; gap: var(--space-lg); }

  .form-group { display: flex; flex-direction: column; gap: var(--space-xs); }
  .form-group > label:first-child {
    font-size: var(--text-sm); font-weight: 500; color: var(--color-text-secondary);
  }
  .form-group input[type='text'],
  .form-group input[type='date'] {
    padding: var(--space-md); border: 1.5px solid var(--color-border);
    border-radius: var(--radius-lg); font-size: var(--text-md);
    background: var(--color-surface); color: var(--color-text-primary);
    font-family: var(--font-default);
  }
  .form-group input:focus { outline: none; border-color: var(--color-primary-light); }

  /* Photo upload — identical to /pets/new */
  .photo-input-hidden {
    position: absolute; width: 1px; height: 1px; padding: 0;
    margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0;
  }
  .photo-upload {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: var(--space-sm); width: 140px; height: 140px;
    border: 2px dashed var(--color-border); border-radius: var(--radius-full);
    cursor: pointer; color: var(--color-text-muted); font-size: var(--text-sm);
    transition: border-color 0.2s, background 0.2s; position: relative; overflow: hidden;
    background: var(--color-primary-soft);
  }
  .photo-upload:hover {
    border-color: var(--color-primary-light); background: var(--color-primary-soft);
    color: var(--color-primary);
  }
  .photo-upload svg { width: 32px; height: 32px; }
  .photo-upload.has-preview { border-style: solid; border-color: var(--color-primary-light); }
  .photo-preview-img { width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; }
  .photo-change {
    position: absolute; bottom: 0; left: 0; right: 0;
    background: rgba(108,92,231,0.75); color: white;
    font-size: var(--text-xs); font-weight: 600; text-align: center; padding: var(--space-xs);
  }

  /* Species card grid — identical to /pets/new */
  .species-grid { display: flex; gap: var(--space-sm); }
  .species-btn {
    flex: 1; display: flex; flex-direction: column; align-items: center; gap: var(--space-xs);
    padding: var(--space-md); border: 2px solid var(--color-border);
    border-radius: var(--radius-xl); background: var(--color-surface); cursor: pointer;
    transition: all 0.2s; font-family: var(--font-default);
  }
  .species-btn.active {
    border-color: var(--color-primary); background: var(--color-primary-soft);
    box-shadow: 0 2px 12px rgba(108,92,231,0.15);
  }
  .species-btn:active { transform: scale(0.95); }
  .species-emoji { font-size: 28px; }
  .species-label { font-size: var(--text-xs); font-weight: 500; color: var(--color-text-secondary); }
  .species-btn.active .species-label { color: var(--color-primary); font-weight: 600; }

  .checkbox-group { flex-direction: row; align-items: center; }
  .checkbox-group label {
    display: flex; align-items: center; gap: var(--space-sm); cursor: pointer;
    font-size: var(--text-sm); font-weight: 500; color: var(--color-text-secondary);
  }
  .checkbox-group input[type='checkbox'] {
    width: 18px; height: 18px; accent-color: var(--color-primary);
  }

  .form-actions { display: flex; gap: var(--space-md); margin-top: var(--space-xs); }

  .btn-submit {
    flex: 1; padding: var(--space-lg); background: var(--color-primary); color: white;
    border: none; border-radius: var(--radius-lg); font-weight: 600;
    font-size: var(--text-md); cursor: pointer; font-family: var(--font-default);
  }
  .btn-submit:hover:not(:disabled) { opacity: 0.9; }
  .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

  .btn-delete {
    padding: var(--space-lg) var(--space-xl); background: transparent;
    color: var(--color-error); border: 1.5px solid var(--color-error);
    border-radius: var(--radius-lg); font-weight: 600; font-size: var(--text-sm);
    cursor: pointer; font-family: var(--font-default);
  }
  .btn-delete:hover { background: rgba(225,112,85,0.06); }
</style>
