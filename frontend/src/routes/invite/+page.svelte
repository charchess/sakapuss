<script lang="ts">
  import { getApiUrl } from '$lib/api';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  const token = $derived($page.url.searchParams.get('token') || '');
  let accepting = $state(false);
  let error = $state('');

  function authHeaders(): Record<string, string> {
    const t = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    return t
      ? { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` }
      : { 'Content-Type': 'application/json' };
  }

  async function accept() {
    if (!token) { error = 'Lien d\'invitation invalide'; return; }
    accepting = true;
    const res = await fetch(`${getApiUrl()}/invitations/${token}/accept`, {
      method: 'POST',
      headers: authHeaders(),
    });
    if (res.ok) {
      goto('/');
    } else {
      const data = await res.json().catch(() => ({}));
      error = data.detail || 'Invitation invalide ou déjà utilisée';
      accepting = false;
    }
  }
</script>

<div class="invite-page">
  <div class="invite-card">
    <h1>Bienvenue</h1>
    <p>Tu as été invité(e) à rejoindre un foyer pour suivre la santé des animaux ensemble.</p>

    {#if error}
      <div class="error">{error}</div>
    {/if}

    {#if !token}
      <div class="error">Lien d'invitation manquant.</div>
    {:else}
      <button class="btn-primary" onclick={accept} disabled={accepting}>
        {accepting ? 'En cours…' : 'Accepter'}
      </button>
    {/if}
  </div>
</div>

<style>
  .invite-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: var(--space-xl); }
  .invite-card { max-width: 420px; background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-2xl); box-shadow: var(--elevation-md); text-align: center; }
  h1 { font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 800; color: var(--color-primary); margin-bottom: var(--space-md); }
  p { color: var(--color-text-secondary); margin-bottom: var(--space-xl); }
  .error { padding: var(--space-md); background: rgba(225,112,85,0.1); border-left: 3px solid var(--color-error); border-radius: var(--radius-md); color: var(--color-error); margin-bottom: var(--space-lg); font-size: var(--text-sm); }
  .btn-primary { width: 100%; padding: var(--space-lg); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-size: var(--text-md); font-weight: 600; cursor: pointer; font-family: var(--font-default); }
  .btn-primary:disabled { opacity: 0.6; }
</style>
