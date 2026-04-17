<script lang="ts">
  import { getApiUrl } from '$lib/api';
  import { onMount } from 'svelte';

  interface Pet { id: string; name: string; species: string; }
  interface VetShare {
    id: string;
    token: string;
    share_url: string;
    vet_email: string;
    pet_ids?: string[];
    status: string;
  }

  let pets = $state<Pet[]>([]);
  let shares = $state<VetShare[]>([]);
  let selectedPetIds = $state<string[]>([]);
  let vetEmail = $state('');
  let toast = $state('');
  let revokeConfirmId = $state('');

  function authHeaders(): Record<string, string> {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    return token
      ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' };
  }

  onMount(async () => {
    const [petsRes, sharesRes] = await Promise.all([
      fetch(`${getApiUrl()}/pets`),
      fetch(`${getApiUrl()}/vet-shares`),
    ]);
    if (petsRes.ok) pets = await petsRes.json();
    if (sharesRes.ok) shares = (await sharesRes.json()).filter((s: VetShare) => s.status !== 'revoked');
  });

  function togglePet(id: string) {
    if (selectedPetIds.includes(id)) {
      selectedPetIds = selectedPetIds.filter(p => p !== id);
    } else {
      selectedPetIds = [...selectedPetIds, id];
    }
  }

  async function sendShare() {
    if (!vetEmail || selectedPetIds.length === 0) return;
    const res = await fetch(`${getApiUrl()}/vet-shares`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ pet_ids: selectedPetIds, vet_email: vetEmail }),
    });
    if (res.ok) {
      const share = await res.json();
      shares = [...shares, share];
      vetEmail = '';
      selectedPetIds = [];
      toast = 'Lien envoyé';
      setTimeout(() => (toast = ''), 3000);
    }
  }

  async function revokeShare(id: string) {
    const res = await fetch(`${getApiUrl()}/vet-shares/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (res.ok || res.status === 204) {
      shares = shares.filter(s => s.id !== id);
    }
    revokeConfirmId = '';
  }

  function getPetName(petId: string): string {
    return pets.find(p => p.id === petId)?.name || petId;
  }
</script>

<svelte:head><title>Partage vétérinaire — Sakapuss</title></svelte:head>

<div class="vet-sharing-page">
  <h1>Partage vétérinaire</h1>
  <p class="subtitle">Partagez le dossier de vos animaux avec votre vétérinaire.</p>

  <section class="share-form">
    <h2>Nouveau partage</h2>

    <div class="animal-multi-select" data-testid="animal-multi-select">
      {#each pets as pet}
        <button
          class="pet-toggle"
          class:selected={selectedPetIds.includes(pet.id)}
          onclick={() => togglePet(pet.id)}
        >
          {pet.name}
        </button>
      {/each}
      {#if pets.length === 0}
        <p class="empty">Aucun animal enregistré</p>
      {/if}
    </div>

    <div class="field">
      <label for="vet-email">Email du vétérinaire</label>
      <input
        id="vet-email"
        type="email"
        bind:value={vetEmail}
        placeholder="dr.martin@vetclinic.com"
      />
    </div>

    <div class="share-preview" data-testid="share-preview">
      {#if selectedPetIds.length > 0 && vetEmail}
        <p>
          Partager le dossier de <strong>{selectedPetIds.map(id => getPetName(id)).join(', ')}</strong>
          avec <strong>{vetEmail}</strong>
        </p>
      {:else}
        <p class="empty-preview">Sélectionnez des animaux et entrez un email pour prévisualiser.</p>
      {/if}
    </div>

    <button
      class="btn-primary"
      onclick={sendShare}
      disabled={!vetEmail || selectedPetIds.length === 0}
    >
      Envoyer le lien
    </button>
  </section>

  {#if toast}
    <div class="toast-msg" data-testid="toast-message">{toast}</div>
  {/if}

  {#if shares.length > 0}
    <section class="active-shares">
      <h2>Partages actifs</h2>
      {#each shares as share}
        <div class="active-share-card" data-testid="active-share-card">
          <div class="share-info">
            <div class="share-email">{share.vet_email}</div>
            {#if share.pet_ids}
              <div class="share-pets">{share.pet_ids.map(id => getPetName(id)).join(', ')}</div>
            {/if}
          </div>
          <button class="btn-revoke" onclick={() => revokeConfirmId = share.id}>Révoquer</button>
        </div>
      {/each}
    </section>
  {/if}

  {#if revokeConfirmId}
    <div class="dialog-backdrop" onclick={() => revokeConfirmId = ''} role="presentation"></div>
    <div role="dialog" class="confirm-dialog">
      <h3>Révoquer ce partage ?</h3>
      <p>Le lien partagé ne sera plus accessible.</p>
      <div class="dialog-btns">
        <button onclick={() => revokeConfirmId = ''}>Annuler</button>
        <button class="btn-confirm" onclick={() => revokeShare(revokeConfirmId)}>Confirmer</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .vet-sharing-page { max-width: 560px; margin: 0 auto; padding: 52px var(--space-lg) var(--space-xl); }
  h1 { font-family: var(--font-display); margin-bottom: var(--space-xs); }
  .subtitle { color: var(--color-text-muted); font-size: var(--text-sm); margin-bottom: var(--space-xl); }
  .share-form { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-xl); box-shadow: var(--elevation-sm); margin-bottom: var(--space-xl); }
  h2 { font-size: var(--text-lg); margin-bottom: var(--space-md); }
  .animal-multi-select { display: flex; flex-wrap: wrap; gap: var(--space-sm); margin-bottom: var(--space-lg); }
  .pet-toggle { padding: var(--space-sm) var(--space-md); border: 1.5px solid var(--color-border); border-radius: var(--radius-full); background: none; cursor: pointer; font-family: var(--font-default); font-size: var(--text-sm); transition: all 0.2s; }
  .pet-toggle.selected { border-color: var(--color-primary); background: var(--color-primary-soft); color: var(--color-primary); font-weight: 600; }
  .field { margin-bottom: var(--space-lg); }
  .field label { display: block; font-size: var(--text-sm); font-weight: 600; color: var(--color-text-secondary); margin-bottom: var(--space-xs); }
  .field input { width: 100%; padding: var(--space-md); border: 1.5px solid var(--color-border); border-radius: var(--radius-lg); font-size: var(--text-md); font-family: var(--font-default); box-sizing: border-box; }
  .field input:focus { outline: none; border-color: var(--color-primary-light); }
  .share-preview { background: var(--color-bg); border-radius: var(--radius-lg); padding: var(--space-md); margin-bottom: var(--space-lg); font-size: var(--text-sm); min-height: 48px; }
  .empty-preview { color: var(--color-text-muted); }
  .empty { color: var(--color-text-muted); font-size: var(--text-sm); }
  .btn-primary { width: 100%; padding: var(--space-md); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-size: var(--text-md); font-weight: 600; cursor: pointer; font-family: var(--font-default); }
  .btn-primary:disabled { opacity: 0.5; }
  .toast-msg { position: fixed; bottom: 88px; left: var(--space-lg); right: var(--space-lg); background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-lg); box-shadow: 0 8px 32px rgba(0,0,0,0.12); font-weight: 600; color: var(--color-success); text-align: center; z-index: 55; animation: slideIn 0.35s cubic-bezier(0.32, 0.72, 0, 1); }
  @keyframes slideIn { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .active-shares { margin-top: var(--space-xl); }
  .active-share-card { display: flex; justify-content: space-between; align-items: center; padding: var(--space-md); background: var(--color-surface); border-radius: var(--radius-lg); margin-bottom: var(--space-sm); box-shadow: var(--elevation-sm); }
  .share-info { display: flex; flex-direction: column; gap: 2px; }
  .share-email { font-weight: 600; font-size: var(--text-sm); }
  .share-pets { font-size: var(--text-xs); color: var(--color-text-muted); }
  .btn-revoke { font-size: var(--text-xs); padding: 4px 10px; border-radius: var(--radius-md); border: 1.5px solid var(--color-error); color: var(--color-error); background: none; cursor: pointer; font-family: var(--font-default); }
  .dialog-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 70; }
  .confirm-dialog { position: fixed; bottom: 50%; left: 50%; transform: translate(-50%, 50%); background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-xl); z-index: 71; min-width: 280px; box-shadow: var(--elevation-lg); }
  .confirm-dialog h3 { margin-bottom: var(--space-sm); font-family: var(--font-display); }
  .confirm-dialog p { color: var(--color-text-muted); font-size: var(--text-sm); margin-bottom: var(--space-lg); }
  .dialog-btns { display: flex; gap: var(--space-md); }
  .dialog-btns button { flex: 1; padding: var(--space-md); border-radius: var(--radius-lg); border: 1.5px solid var(--color-border); cursor: pointer; font-family: var(--font-default); background: none; }
  .btn-confirm { background: var(--color-error) !important; color: white; border-color: var(--color-error) !important; font-weight: 600; }
</style>
