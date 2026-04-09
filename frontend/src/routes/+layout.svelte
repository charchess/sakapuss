<script>
  import '../app.css';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import { page } from '$app/stores';

  let { children } = $props();

  const authPages = ['/login', '/register'];
  const showNav = $derived(!authPages.includes($page.url.pathname));
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
