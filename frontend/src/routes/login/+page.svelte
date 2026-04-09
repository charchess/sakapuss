<script lang="ts">
  import { getApiUrl } from '$lib/api';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  let email = $state('');
  let password = $state('');
  let error = $state('');
  let isLoading = $state(false);

  const formValid = $derived(email.length > 0 && password.length > 0);

  // Get redirect param if present
  const redirectTo = $derived($page.url.searchParams.get('redirect') || '/');

  async function handleLogin(e: Event) {
    e.preventDefault();
    if (!formValid) return;

    isLoading = true;
    error = '';

    try {
      const res = await fetch(`${getApiUrl()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.status === 401) {
        error = 'Email ou mot de passe invalide';
        return;
      }

      if (!res.ok) {
        error = 'Erreur de connexion';
        return;
      }

      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      await goto(redirectTo);
    } catch {
      error = 'Erreur de connexion au serveur';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="login-page">
  <div class="login-card">
    <div class="logo-area">
      <svg class="cat-logo" viewBox="0 0 64 64" fill="none">
        <path d="M32 56c-12 0-20-6-20-14s3-14 8-20l3-14 8 8h2l8-8 3 14c5 6 8 12 8 20s-8 14-20 14z" fill="var(--color-primary-light)" stroke="var(--color-primary)" stroke-width="2"/>
        <circle cx="24" cy="36" r="3" fill="var(--color-primary)"/>
        <circle cx="40" cy="36" r="3" fill="var(--color-primary)"/>
        <path d="M28 44c1.5 1.5 4 2.5 4 2.5s2.5-1 4-2.5" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <h1 class="app-name">Sakapuss</h1>
    </div>

    <form onsubmit={handleLogin}>
      <div class="field">
        <label for="email">Email</label>
        <input id="email" type="email" bind:value={email} placeholder="camille@exemple.fr" autocomplete="email" />
      </div>

      <div class="field">
        <label for="password">Mot de passe</label>
        <input id="password" type="password" bind:value={password} placeholder="Mot de passe" autocomplete="current-password" />
      </div>

      {#if error}
        <div class="error-msg" role="alert">{error}</div>
      {/if}

      <button type="submit" class="btn-primary" disabled={!formValid || isLoading}>
        {isLoading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>

    <p class="register-link">
      Pas encore de compte ? <a href="/register">Créer un compte</a>
    </p>
  </div>
</div>

<style>
  .login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-xl);
    background: var(--color-bg);
  }
  .login-card {
    width: 100%;
    max-width: 400px;
    background: var(--color-surface);
    border-radius: var(--radius-xl);
    padding: var(--space-2xl);
    box-shadow: var(--elevation-md);
  }
  .logo-area { text-align: center; margin-bottom: var(--space-2xl); }
  .cat-logo { width: 64px; height: 64px; margin-bottom: var(--space-md); }
  .app-name {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    font-weight: 800;
    color: var(--color-primary);
  }
  form { display: flex; flex-direction: column; gap: var(--space-lg); }
  .field { display: flex; flex-direction: column; gap: var(--space-xs); }
  label { font-size: var(--text-sm); font-weight: 500; color: var(--color-text-secondary); }
  input {
    width: 100%;
    padding: var(--space-md);
    border: 1.5px solid var(--color-border);
    border-radius: var(--radius-lg);
    font-size: var(--text-md);
    font-family: var(--font-default);
    color: var(--color-text-primary);
  }
  input:focus { outline: none; border-color: var(--color-primary-light); box-shadow: 0 0 0 3px var(--color-primary-soft); }
  .error-msg {
    padding: var(--space-md);
    background: rgba(225, 112, 85, 0.1);
    border-left: 3px solid var(--color-error);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    color: var(--color-error);
  }
  .btn-primary {
    width: 100%;
    padding: var(--space-lg);
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--radius-lg);
    font-size: var(--text-md);
    font-weight: 600;
    font-family: var(--font-default);
    cursor: pointer;
  }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-primary:active:not(:disabled) { transform: scale(0.98); }
  .register-link { text-align: center; margin-top: var(--space-xl); font-size: var(--text-sm); color: var(--color-text-muted); }
  .register-link a { color: var(--color-primary); font-weight: 500; }
</style>
