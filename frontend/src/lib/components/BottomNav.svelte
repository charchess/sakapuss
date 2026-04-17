<script lang="ts">
  import { page } from '$app/stores';
  import { getApiUrl } from '$lib/api';
  import { onMount } from 'svelte';

  let profileBadge = $state(false);
  let userRole = $state('admin');

  const navItems = [
    { href: '/', label: 'Accueil', icon: 'home' },
    { href: '/timeline', label: 'Timeline', icon: 'timeline' },
    { href: '#quicklog', label: '+', icon: 'add', isCenter: true },
    { href: '/reminders', label: 'Rappels', icon: 'bell' },
    { href: '/settings', label: 'Paramètres', icon: 'user' },
  ];

  const isActive = (href: string, currentPath: string) => {
    if (href === '/') return currentPath === '/';
    return currentPath.startsWith(href);
  };

  // Check if features need configuration
  onMount(async () => {
    // Read user role from localStorage
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      userRole = u.role || 'admin';
    } catch { /* ignore */ }

    try {
      const [bowlsRes, resourcesRes, productsRes] = await Promise.all([
        fetch(`${getApiUrl()}/bowls`).catch(() => null),
        fetch(`${getApiUrl()}/resources?type=litter`).catch(() => null),
        fetch(`${getApiUrl()}/food/products`).catch(() => null),
      ]);
      const bowls = bowlsRes?.ok ? await bowlsRes.json() : [];
      const litter = resourcesRes?.ok ? await resourcesRes.json() : [];
      const products = productsRes?.ok ? await productsRes.json() : [];
      profileBadge = bowls.length === 0 || litter.length === 0 || products.length === 0;
    } catch { /* ignore */ }
  });
</script>

<nav class="bottom-nav" role="navigation" aria-label="Navigation principale" data-testid="bottom-nav">
  <div class="sidebar-header">
    <svg class="sidebar-logo" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 28c-6 0-10-3-10-7s1.5-7 4-10l1.5-7 4 4h1l4-4 1.5 7c2.5 3 4 6 4 10s-4 7-10 7z" fill="var(--color-primary-light)" stroke="var(--color-primary)" stroke-width="1.5"/>
      <circle cx="12" cy="18" r="1.5" fill="var(--color-primary)"/>
      <circle cx="20" cy="18" r="1.5" fill="var(--color-primary)"/>
    </svg>
    <span class="sidebar-app-name">Sakapuss</span>
  </div>

  {#each navItems as item}
    {#if item.isCenter}
      {#if userRole !== 'readonly'}
        <a href={item.href} class="nav-center" aria-label="Quick Log" data-testid="fab-add-button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span class="nav-center-label">Quick Log</span>
        </a>
      {/if}
    {:else if item.icon === 'bell' && userRole === 'input'}
      <!-- Hide Reminders tab for input role -->
    {:else}
      <a
        href={item.href}
        class="nav-item"
        class:active={isActive(item.href, $page.url.pathname)}
        aria-current={isActive(item.href, $page.url.pathname) ? 'page' : undefined}
      >
        <span class="nav-icon">
          {#if item.icon === 'user' && profileBadge}
            <span class="nav-badge"></span>
          {/if}
          {#if item.icon === 'home'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          {:else if item.icon === 'timeline'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          {:else if item.icon === 'bell'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 106 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
          {:else if item.icon === 'user'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          {/if}
        </span>
        <span class="nav-label">{item.label}</span>
      </a>
    {/if}
  {/each}
</nav>

<style>
  .sidebar-header {
    display: none;
  }

  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 72px;
    background: var(--color-surface);
    display: flex;
    align-items: center;
    justify-content: space-around;
    z-index: 50;
    box-shadow: 0 -1px 0 var(--color-border);
    padding: 0 var(--space-sm);
    padding-bottom: env(safe-area-inset-bottom, 0);
  }

  @media (min-width: 1024px) {
    .bottom-nav {
      top: 0;
      bottom: 0;
      right: auto;
      width: var(--sidebar-width);
      height: 100vh;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;
      padding: var(--space-xl) var(--space-md);
      gap: var(--space-xs);
      box-shadow: 1px 0 0 var(--color-border);
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-md);
      margin-bottom: var(--space-lg);
    }

    .sidebar-logo {
      width: 28px;
      height: 28px;
      flex-shrink: 0;
    }

    .sidebar-app-name {
      font-family: var(--font-display);
      font-size: var(--text-lg);
      font-weight: 800;
      color: var(--color-primary);
    }

    .nav-item {
      flex-direction: row;
      gap: var(--space-md);
      width: 100%;
      padding: var(--space-md);
      border-radius: var(--radius-lg);
      justify-content: flex-start;
      min-height: 44px;
    }

    .nav-item:hover {
      background: var(--color-primary-soft);
    }

    .nav-item.active {
      background: var(--color-primary-soft);
    }

    .nav-icon svg {
      opacity: 0.5;
    }

    .nav-item.active .nav-icon svg {
      opacity: 1;
    }

    .nav-label {
      font-size: var(--text-sm);
    }

    .nav-center {
      flex-direction: row;
      gap: var(--space-md);
      width: 100%;
      height: 44px;
      border-radius: var(--radius-lg);
      margin-top: 0;
      justify-content: flex-start;
      padding: 0 var(--space-md);
    }

    .nav-center svg {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .nav-center-label {
      display: block;
      font-size: var(--text-sm);
      font-weight: 600;
      color: white;
    }
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: var(--space-xs) var(--space-sm);
    text-decoration: none;
    -webkit-tap-highlight-color: transparent;
    min-height: 44px;
    justify-content: center;
  }

  .nav-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .nav-badge {
    position: absolute;
    top: -2px;
    right: -4px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--color-error);
    border: 2px solid var(--color-surface);
    z-index: 1;
  }

  .nav-icon svg {
    width: 22px;
    height: 22px;
    opacity: 0.35;
    transition: opacity 0.2s;
  }

  .nav-item.active .nav-icon svg {
    opacity: 1;
    stroke: var(--color-primary);
  }

  .nav-label {
    font-size: 10px;
    font-weight: 500;
    color: var(--color-text-muted);
    transition: color 0.2s;
  }

  .nav-item.active .nav-label {
    color: var(--color-primary);
    font-weight: 600;
  }

  .nav-center {
    width: 48px;
    height: 48px;
    background: var(--color-primary);
    border-radius: var(--radius-xl);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: -12px;
    box-shadow: 0 4px 16px rgba(108, 92, 231, 0.35);
    transition: transform 0.2s;
    text-decoration: none;
  }

  .nav-center svg {
    width: 24px;
    height: 24px;
    color: white;
  }

  .nav-center:active {
    transform: scale(0.9) rotate(90deg);
  }

  .nav-center-label {
    display: none;
  }
</style>
