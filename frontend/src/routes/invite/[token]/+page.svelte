<script lang="ts">
  import { getApiUrl } from '$lib/api';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  const token = $derived($page.params.token);
  let accepted = $state(false);
  let error = $state('');

  async function accept() {
    const user = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
    const res = await fetch(`${getApiUrl()}/invitations/${token}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id || 'anonymous' }),
    });

    if (res.ok) {
      accepted = true;
      setTimeout(() => goto('/'), 2000);
    } else {
      const data = await res.json();
      error = data.detail || 'Invitation invalide';
    }
  }
</script>

<div class="invite-page">
  {#if accepted}
    <div class="success">
      <div class="icon">✓</div>
      <h1>Bienvenue dans le foyer !</h1>
      <p>Redirection vers le dashboard...</p>
    </div>
  {:else}
    <div class="invite-card">
      <h1>Invitation Sakapuss</h1>
      <p>On t'invite à rejoindre un foyer pour suivre la santé des animaux ensemble.</p>

      {#if error}
        <div class="error">{error}</div>
      {/if}

      <button class="btn-primary" onclick={accept}>Accepter l'invitation</button>
    </div>
  {/if}
</div>

<style>
  .invite-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: var(--space-xl); }
  .invite-card { max-width: 400px; background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-2xl); box-shadow: var(--elevation-md); text-align: center; }
  h1 { font-family: var(--font-display); margin-bottom: var(--space-md); }
  p { color: var(--color-text-secondary); margin-bottom: var(--space-xl); }
  .error { padding: var(--space-md); background: rgba(225,112,85,0.1); border-left: 3px solid var(--color-error); border-radius: var(--radius-md); color: var(--color-error); margin-bottom: var(--space-lg); font-size: var(--text-sm); }
  .btn-primary { width: 100%; padding: var(--space-lg); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-size: var(--text-md); font-weight: 600; cursor: pointer; }
  .success { text-align: center; }
  .icon { font-size: 64px; color: var(--color-success); margin-bottom: var(--space-lg); }
  .success h1 { color: var(--color-success); }
</style>
