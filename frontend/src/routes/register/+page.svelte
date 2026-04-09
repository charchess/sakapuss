<script lang="ts">
  import { getApiUrl } from '$lib/api';
  import { goto } from '$app/navigation';

  let email = $state('');
  let password = $state('');
  let confirmPassword = $state('');
  let serverError = $state('');
  let isLoading = $state(false);

  const emailValid = $derived(email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  const passwordValid = $derived(password.length >= 8);
  const passwordsMatch = $derived(password === confirmPassword && confirmPassword.length > 0);
  const formValid = $derived(emailValid && passwordValid && passwordsMatch);

  async function handleRegister(e: Event) {
    e.preventDefault();
    if (!formValid) return;

    isLoading = true;
    serverError = '';

    try {
      const res = await fetch(`${getApiUrl()}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.status === 409) {
        serverError = 'Un compte avec cet email existe déjà';
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        serverError = data.detail || 'Erreur lors de l\'inscription';
        return;
      }

      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      await goto('/');
    } catch {
      serverError = 'Erreur de connexion au serveur';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="register-page">
  <div class="register-card">
    <!-- Cat illustration -->
    <div class="logo-area">
      <svg class="cat-logo" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 56c-12 0-20-6-20-14s3-14 8-20l3-14 8 8h2l8-8 3 14c5 6 8 12 8 20s-8 14-20 14z" fill="var(--color-primary-light)" stroke="var(--color-primary)" stroke-width="2"/>
        <circle cx="24" cy="36" r="3" fill="var(--color-primary)"/>
        <circle cx="40" cy="36" r="3" fill="var(--color-primary)"/>
        <path d="M28 44c1.5 1.5 4 2.5 4 2.5s2.5-1 4-2.5" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <h1 class="app-name">Sakapuss</h1>
      <p class="tagline">Le carnet de santé qui parle pour tes animaux</p>
    </div>

    <form onsubmit={handleRegister}>
      <!-- Email -->
      <div class="field">
        <label for="email">Email</label>
        <div class="input-wrap">
          <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="M22 4L12 13 2 4"/>
          </svg>
          <input
            id="email"
            type="email"
            bind:value={email}
            placeholder="camille@exemple.fr"
            autocomplete="email"
          />
        </div>
        {#if email.length > 0 && !emailValid}
          <span class="error">Format d'email invalide</span>
        {/if}
      </div>

      <!-- Password -->
      <div class="field">
        <label for="password">Mot de passe</label>
        <div class="input-wrap">
          <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          <input
            id="password"
            type="password"
            bind:value={password}
            placeholder="8 caractères minimum"
            autocomplete="new-password"
          />
        </div>
        {#if password.length > 0 && !passwordValid}
          <span class="error">8 caractères minimum</span>
        {/if}
      </div>

      <!-- Confirm -->
      <div class="field">
        <label for="confirm">Confirmer le mot de passe</label>
        <div class="input-wrap">
          <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          <input
            id="confirm"
            type="password"
            bind:value={confirmPassword}
            placeholder="Identique au mot de passe"
            autocomplete="new-password"
          />
        </div>
        {#if confirmPassword.length > 0 && !passwordsMatch}
          <span class="error">Les mots de passe ne correspondent pas</span>
        {/if}
      </div>

      <!-- Server error -->
      {#if serverError}
        <div class="server-error" role="alert">{serverError}</div>
      {/if}

      <!-- Submit -->
      <button type="submit" class="btn-primary" disabled={!formValid || isLoading}>
        {#if isLoading}
          Création...
        {:else}
          Créer mon compte
        {/if}
      </button>
    </form>

    <!-- Login link -->
    <p class="login-link">
      Déjà un compte ? <a href="/login">Se connecter</a>
    </p>
  </div>
</div>

<style>
  .register-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-xl);
    background: var(--color-bg);
  }

  .register-card {
    width: 100%;
    max-width: 400px;
    background: var(--color-surface);
    border-radius: var(--radius-xl);
    padding: var(--space-2xl);
    box-shadow: var(--elevation-md);
  }

  .logo-area {
    text-align: center;
    margin-bottom: var(--space-2xl);
  }

  .cat-logo {
    width: 72px;
    height: 72px;
    margin-bottom: var(--space-md);
  }

  .app-name {
    font-family: var(--font-display);
    font-size: var(--text-3xl);
    font-weight: 800;
    color: var(--color-primary);
    margin-bottom: var(--space-xs);
  }

  .tagline {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  form {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  label {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text-secondary);
  }

  .input-wrap {
    position: relative;
  }

  .input-icon {
    position: absolute;
    left: var(--space-md);
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    color: var(--color-text-muted);
    pointer-events: none;
  }

  input {
    width: 100%;
    padding: var(--space-md) var(--space-md) var(--space-md) 42px;
    border: 1.5px solid var(--color-border);
    border-radius: var(--radius-lg);
    font-size: var(--text-md);
    font-family: var(--font-default);
    color: var(--color-text-primary);
    background: var(--color-surface);
    transition: border-color 0.2s;
  }

  input:focus {
    outline: none;
    border-color: var(--color-primary-light);
    box-shadow: 0 0 0 3px var(--color-primary-soft);
  }

  input::placeholder {
    color: var(--color-text-muted);
  }

  .error {
    font-size: var(--text-xs);
    color: var(--color-error);
    padding-left: var(--space-xs);
  }

  .server-error {
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
    transition: opacity 0.2s, transform 0.15s;
  }

  .btn-primary:hover:not(:disabled) {
    opacity: 0.9;
  }

  .btn-primary:active:not(:disabled) {
    transform: scale(0.98);
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .login-link {
    text-align: center;
    margin-top: var(--space-xl);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .login-link a {
    color: var(--color-primary);
    font-weight: 500;
  }
</style>
