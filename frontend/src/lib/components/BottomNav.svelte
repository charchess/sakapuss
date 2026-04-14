<script lang="ts">
  import { page } from '$app/stores';
  import { getApiUrl } from '$lib/api';
  import { onMount } from 'svelte';

  let profileBadge = $state(false);

  const navItems = [
    { href: '/', label: 'Accueil', icon: 'home' },
    { href: '/timeline', label: 'Timeline', icon: 'timeline' },
    { href: '#quicklog', label: '+', icon: 'add', isCenter: true },
    { href: '/reminders', label: 'Rappels', icon: 'bell' },
    { href: '/settings', label: 'Profil', icon: 'user' },
  ];

  const isActive = (href: string, currentPath: string) => {
    if (href === '/') return currentPath === '/';
    return currentPath.startsWith(href);
  };

  // Check if features need configuration
  onMount(async () => {
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

<nav class="bottom-nav" role="navigation" aria-label="Navigation principale">
  {#each navItems as item}
    {#if item.isCenter}
      <a href={item.href} class="nav-center" aria-label="Quick Log">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </a>
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
</style>
