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
    <h2>Configuration des features</h2>
    <a href="/settings/litter" class="config-link">
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-cat-litter)" stroke-width="2" stroke-linecap="round"><path d="M12 3v5M8 5l1.5 3M16 5l-1.5 3"/><path d="M7 10h10l-1.5 8a2 2 0 01-2 1.5h-3a2 2 0 01-2-1.5L7 10z"/></svg>
      <span>Caisses / Litières</span>
      <span class="arrow">›</span>
    </a>
    <a href="/settings/bowls" class="config-link">
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-cat-food)" stroke-width="2" stroke-linecap="round"><path d="M4 12a8 8 0 0016 0"/><path d="M3 12h18"/></svg>
      <span>Gamelles</span>
      <span class="arrow">›</span>
    </a>
    <a href="/settings/food" class="config-link">
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round"><path d="M4 12a8 8 0 0016 0"/><path d="M3 12h18"/><path d="M9 8c0-1 1-2 1-3M15 8c0-1 1-2 1-3" opacity="0.4"/></svg>
      <span>Produits alimentaires</span>
      <span class="arrow">›</span>
    </a>
    <a href="/settings/food-stock" class="config-link">
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-cat-food)" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      <span>Stock (sacs)</span>
      <span class="arrow">›</span>
    </a>
    <a href="/settings/household" class="config-link">
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" stroke-width="2" stroke-linecap="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>
      <span>Membres du foyer</span>
      <span class="arrow">›</span>
    </a>
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
  .config-link {
    display: flex; align-items: center; gap: var(--space-md);
    padding: var(--space-md) 0; border-bottom: 1px solid var(--color-border);
    text-decoration: none; color: var(--color-text-primary); font-size: var(--text-md);
    transition: opacity 0.15s;
  }
  .config-link:last-of-type { border-bottom: none; }
  .config-link:hover { text-decoration: none; opacity: 0.8; }
  .config-link svg { width: 22px; height: 22px; flex-shrink: 0; }
  .config-link span { flex: 1; }
  .config-link .arrow { flex: 0; color: var(--color-text-muted); font-size: 20px; }
  .error-msg { padding: var(--space-md); background: rgba(225,112,85,0.1); border-left: 3px solid var(--color-error); border-radius: var(--radius-md); font-size: var(--text-sm); color: var(--color-error); margin-bottom: var(--space-md); }
  .success-msg { padding: var(--space-md); background: rgba(0,184,148,0.1); border-left: 3px solid var(--color-success); border-radius: var(--radius-md); font-size: var(--text-sm); color: var(--color-success); margin-bottom: var(--space-md); }
  .btn-primary { width: 100%; padding: var(--space-lg); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-size: var(--text-md); font-weight: 600; cursor: pointer; font-family: var(--font-default); }
  .btn-primary:active { transform: scale(0.98); }
</style>
