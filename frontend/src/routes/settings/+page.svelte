<script lang="ts">
  import { getApiUrl } from '$lib/api';
  import { onMount } from 'svelte';

  let displayName = $state('');
  let language = $state('fr');
  let saved = $state(false);
  let error = $state('');

  function getToken(): string | null {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  }

  onMount(async () => {
    const token = getToken();
    if (!token) return;
    const res = await fetch(`${getApiUrl()}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const user = await res.json();
      displayName = user.display_name || '';
      language = user.language || 'fr';
    }
  });

  async function handleSave() {
    saved = false;
    error = '';
    const token = getToken();
    if (!token) return;

    const res = await fetch(`${getApiUrl()}/auth/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ display_name: displayName || null, language }),
    });

    if (res.ok) {
      const user = await res.json();
      localStorage.setItem('user', JSON.stringify(user));
      saved = true;
      setTimeout(() => (saved = false), 3000);
    } else {
      error = 'Erreur lors de la sauvegarde';
    }
  }
</script>

<div class="settings-page">
  <h1>Paramètres</h1>

  <section class="settings-section">
    <h2>Compte</h2>
    <div class="field">
      <label for="name">Nom d'affichage</label>
      <input id="name" type="text" bind:value={displayName} placeholder="Camille" />
    </div>
  </section>

  <section class="settings-section">
    <h2>Langue</h2>
    <div class="lang-options">
      <label class="lang-option" class:active={language === 'fr'}>
        <input type="radio" name="lang" value="fr" bind:group={language} />
        Français
      </label>
      <label class="lang-option" class:active={language === 'en'}>
        <input type="radio" name="lang" value="en" bind:group={language} />
        English
      </label>
    </div>
  </section>

  <section class="settings-section">
    <h2>Notifications</h2>
    <p class="placeholder">Les préférences de notification arrivent bientôt.</p>
  </section>

  {#if error}
    <div class="error-msg">{error}</div>
  {/if}

  {#if saved}
    <div class="success-msg">Sauvegardé !</div>
  {/if}

  <button class="btn-primary" onclick={handleSave}>Enregistrer</button>
</div>

<style>
  .settings-page { max-width: 500px; margin: 0 auto; padding: var(--space-xl); }
  h1 { font-family: var(--font-display); margin-bottom: var(--space-xl); }
  .settings-section {
    background: var(--color-surface);
    border-radius: var(--radius-xl);
    padding: var(--space-lg);
    margin-bottom: var(--space-lg);
    box-shadow: var(--elevation-sm);
  }
  h2 { font-size: var(--text-lg); margin-bottom: var(--space-md); }
  .field { display: flex; flex-direction: column; gap: var(--space-xs); }
  label { font-size: var(--text-sm); font-weight: 500; color: var(--color-text-secondary); }
  input[type="text"] {
    padding: var(--space-md);
    border: 1.5px solid var(--color-border);
    border-radius: var(--radius-lg);
    font-size: var(--text-md);
    font-family: var(--font-default);
  }
  input[type="text"]:focus { outline: none; border-color: var(--color-primary-light); }
  .lang-options { display: flex; gap: var(--space-md); }
  .lang-option {
    flex: 1;
    padding: var(--space-md);
    border: 1.5px solid var(--color-border);
    border-radius: var(--radius-lg);
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    font-size: var(--text-md);
  }
  .lang-option.active { border-color: var(--color-primary); background: var(--color-primary-soft); }
  .lang-option input[type="radio"] { display: none; }
  .placeholder { font-size: var(--text-sm); color: var(--color-text-muted); }
  .error-msg { padding: var(--space-md); background: rgba(225,112,85,0.1); border-left: 3px solid var(--color-error); border-radius: var(--radius-md); font-size: var(--text-sm); color: var(--color-error); margin-bottom: var(--space-md); }
  .success-msg { padding: var(--space-md); background: rgba(0,184,148,0.1); border-left: 3px solid var(--color-success); border-radius: var(--radius-md); font-size: var(--text-sm); color: var(--color-success); margin-bottom: var(--space-md); }
  .btn-primary { width: 100%; padding: var(--space-lg); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-size: var(--text-md); font-weight: 600; cursor: pointer; font-family: var(--font-default); }
  .btn-primary:active { transform: scale(0.98); }
</style>
