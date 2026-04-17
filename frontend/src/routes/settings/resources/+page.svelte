<script lang="ts">
  import { getApiUrl } from '$lib/api';
  import { onMount } from 'svelte';

  interface Resource {
    id: string;
    name: string;
    type: string;
    color: string | null;
    tracking_mode: string | null;
    enabled: boolean;
  }

  const typeLabels: Record<string, string> = {
    litter: 'Litière',
    food_bowl: 'Gamelle',
    water: 'Eau',
  };

  let resources = $state<Resource[]>([]);
  let showForm = $state(false);
  let editingId = $state('');
  let formName = $state('');
  let formType = $state('litter');
  let deleteConfirmId = $state('');

  function authHeaders(): Record<string, string> {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    return token
      ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' };
  }

  onMount(async () => {
    await loadResources();
  });

  async function loadResources() {
    const res = await fetch(`${getApiUrl()}/resources`);
    if (res.ok) resources = await res.json();
  }

  function openAdd() {
    editingId = '';
    formName = '';
    formType = 'litter';
    showForm = true;
  }

  function openEdit(r: Resource) {
    editingId = r.id;
    formName = r.name;
    formType = r.type;
    showForm = true;
  }

  function cancelForm() {
    showForm = false;
    editingId = '';
  }

  async function saveResource() {
    const headers = authHeaders();
    if (editingId) {
      const res = await fetch(`${getApiUrl()}/resources/${editingId}`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ name: formName }),
      });
      if (res.ok) await loadResources();
    } else {
      const res = await fetch(`${getApiUrl()}/resources`, {
        method: 'POST', headers,
        body: JSON.stringify({ name: formName, type: formType }),
      });
      if (res.ok) await loadResources();
    }
    showForm = false;
    editingId = '';
  }

  async function deleteResource(id: string) {
    const headers = authHeaders();
    const res = await fetch(`${getApiUrl()}/resources/${id}`, {
      method: 'DELETE', headers,
    });
    if (res.ok || res.status === 204) {
      resources = resources.filter(r => r.id !== id);
    }
    deleteConfirmId = '';
  }
</script>

<svelte:head><title>Ressources — Sakapuss</title></svelte:head>

<div class="resources-page">
  <h1>Ressources du foyer</h1>

  <div class="resource-list" data-testid="resource-list">
    {#if resources.length === 0}
      <p class="empty">Aucune ressource configurée</p>
    {:else}
      {#each resources as r}
        <div class="resource-card" data-testid="resource-card">
          <div class="resource-info">
            <span class="resource-name">{r.name}</span>
            <span class="resource-type">{typeLabels[r.type] || r.type}</span>
          </div>
          <div class="resource-actions">
            <button class="btn-edit" onclick={() => openEdit(r)}>Modifier</button>
            <button class="btn-delete" onclick={() => deleteConfirmId = r.id}>Supprimer</button>
          </div>
        </div>
      {/each}
    {/if}
  </div>

  {#if !showForm}
    <button class="btn-add" onclick={openAdd}>Ajouter</button>
  {/if}

  {#if showForm}
    <div class="form-section">
      <h2>{editingId ? 'Modifier la ressource' : 'Nouvelle ressource'}</h2>
      <div class="field">
        <label for="res-name">Nom</label>
        <input id="res-name" type="text" bind:value={formName} placeholder="Ex: Caisse cuisine" />
      </div>
      {#if !editingId}
        <div class="field">
          <label for="res-type">Type</label>
          <select id="res-type" bind:value={formType}>
            <option value="litter">Litière</option>
            <option value="food_bowl">Gamelle</option>
            <option value="water">Eau</option>
          </select>
        </div>
      {/if}
      <div class="form-btns">
        <button class="btn-cancel" onclick={cancelForm}>Annuler</button>
        <button class="btn-save" onclick={saveResource} disabled={!formName}>Enregistrer</button>
      </div>
    </div>
  {/if}

  {#if deleteConfirmId}
    <div class="dialog-backdrop" onclick={() => deleteConfirmId = ''} role="presentation"></div>
    <div role="dialog" class="confirm-dialog">
      <p>Supprimer cette ressource ?</p>
      <div class="dialog-btns">
        <button onclick={() => deleteConfirmId = ''}>Annuler</button>
        <button class="btn-confirm" onclick={() => deleteResource(deleteConfirmId)}>Confirmer</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .resources-page { max-width: 500px; margin: 0 auto; padding: 52px var(--space-lg) var(--space-xl); }
  h1 { font-family: var(--font-display); margin-bottom: var(--space-xl); }
  h2 { font-size: var(--text-lg); margin-bottom: var(--space-md); }
  .empty { color: var(--color-text-muted); font-size: var(--text-sm); }
  .resource-card { display: flex; justify-content: space-between; align-items: center; padding: var(--space-md); background: var(--color-surface); border-radius: var(--radius-lg); margin-bottom: var(--space-sm); box-shadow: var(--elevation-sm); }
  .resource-info { display: flex; flex-direction: column; gap: 2px; }
  .resource-name { font-weight: 600; font-size: var(--text-md); }
  .resource-type { font-size: var(--text-xs); color: var(--color-text-muted); }
  .resource-actions { display: flex; gap: var(--space-sm); }
  .btn-edit, .btn-delete { font-size: var(--text-xs); padding: 4px 10px; border-radius: var(--radius-md); border: none; cursor: pointer; font-family: var(--font-default); }
  .btn-edit { background: var(--color-primary-soft); color: var(--color-primary); }
  .btn-delete { background: rgba(225,112,85,0.1); color: var(--color-error); }
  .btn-add { width: 100%; padding: var(--space-md); margin-top: var(--space-lg); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-size: var(--text-md); font-weight: 600; cursor: pointer; font-family: var(--font-default); }
  .form-section { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-xl); box-shadow: var(--elevation-sm); margin-top: var(--space-lg); }
  .field { margin-bottom: var(--space-md); }
  .field label { display: block; font-size: var(--text-sm); font-weight: 600; color: var(--color-text-secondary); margin-bottom: var(--space-xs); }
  .field input, .field select { width: 100%; padding: var(--space-md); border: 1.5px solid var(--color-border); border-radius: var(--radius-lg); font-size: var(--text-md); font-family: var(--font-default); box-sizing: border-box; }
  .field input:focus, .field select:focus { outline: none; border-color: var(--color-primary-light); }
  .form-btns { display: flex; gap: var(--space-md); margin-top: var(--space-lg); }
  .btn-cancel { flex: 1; padding: var(--space-md); background: none; border: 1.5px solid var(--color-border); border-radius: var(--radius-lg); cursor: pointer; font-family: var(--font-default); }
  .btn-save { flex: 2; padding: var(--space-md); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; font-family: var(--font-default); }
  .btn-save:disabled { opacity: 0.5; }
  .dialog-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 70; }
  .confirm-dialog { position: fixed; bottom: 50%; left: 50%; transform: translate(-50%, 50%); background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-xl); z-index: 71; min-width: 280px; box-shadow: var(--elevation-lg); }
  .confirm-dialog p { font-size: var(--text-md); font-weight: 600; margin-bottom: var(--space-lg); text-align: center; }
  .dialog-btns { display: flex; gap: var(--space-md); }
  .dialog-btns button { flex: 1; padding: var(--space-md); border-radius: var(--radius-lg); border: 1.5px solid var(--color-border); cursor: pointer; font-family: var(--font-default); background: none; }
  .btn-confirm { background: var(--color-error) !important; color: white; border-color: var(--color-error) !important; font-weight: 600; }
</style>
