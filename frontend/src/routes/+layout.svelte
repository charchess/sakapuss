<script>
  import '../app.css';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  let { children } = $props();

  const publicPages = ['/login', '/register', '/invite'];
  const isPublic = $derived(publicPages.some(p => $page.url.pathname.startsWith(p)) || $page.url.pathname.startsWith('/vet/dossier'));
  const showNav = $derived(!isPublic);

  // Auth guard
  onMount(() => {
    if (!browser) return;
    const token = localStorage.getItem('token');
    if (!token && !isPublic) {
      goto(`/login?redirect=${encodeURIComponent($page.url.pathname)}`);
    }
  });
</script>

<div class="app-shell">
  <main class="app-main" class:has-nav={showNav}>
    {@render children()}
  </main>
  {#if showNav}
    <BottomNav />
  {/if}
</div>

<style>
  .app-shell {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--color-bg);
  }
  .app-main {
    flex: 1;
    width: 100%;
  }
  .app-main.has-nav {
    padding-bottom: 80px;
  }
</style>
