<script lang="ts">
  import { getApiUrl } from '$lib/api';

  interface Pet {
    id: string;
    name: string;
    species: string;
    photo_url?: string;
  }

  let {
    open = $bindable(false),
    action = '',
    pets = [] as Pet[],
    onLogged = (event: any) => {},
  } = $props();

  let selectedPetId = $state('');
  let isLogging = $state(false);

  function getSpeciesEmoji(species: string): string {
    if (species?.toLowerCase().includes('cat') || species?.toLowerCase().includes('chat')) return '🐱';
    if (species?.toLowerCase().includes('dog') || species?.toLowerCase().includes('chien')) return '🐶';
    return '🐾';
  }

  // Auto-skip: if only 1 pet, select it automatically
  $effect(() => {
    if (open && pets.length === 1) {
      logEvent(pets[0].id);
    }
  });

  async function logEvent(petId: string) {
    if (isLogging) return;
    isLogging = true;
    selectedPetId = petId;

    try {
      const res = await fetch(`${getApiUrl()}/pets/${petId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: action,
          payload: { status: 'ras' },
        }),
      });

      if (res.ok) {
        const event = await res.json();
        open = false;
        onLogged(event);
      }
    } finally {
      isLogging = false;
      selectedPetId = '';
    }
  }

  function close() {
    open = false;
    selectedPetId = '';
  }
</script>

{#if open && pets.length > 1}
  <!-- Backdrop -->
  <div class="sheet-backdrop" onclick={close} role="presentation"></div>

  <!-- Bottom Sheet -->
  <div class="bottom-sheet" role="dialog" aria-label="Quick Log Selection">
    <div class="sheet-handle"></div>
    <div class="sheet-content">
      <div class="sheet-question">Pour qui ?</div>
      <div class="sheet-context">{action}</div>

      <div class="animal-selector">
        {#each pets as pet}
          <button
            class="animal-pick"
            class:selected={selectedPetId === pet.id}
            onclick={() => logEvent(pet.id)}
            disabled={isLogging}
            data-testid="pick-{pet.id}"
          >
            <div class="pick-face">
              {#if pet.photo_url}
                <img src={pet.photo_url} alt={pet.name} />
              {:else}
                {getSpeciesEmoji(pet.species)}
              {/if}
            </div>
            <div class="pick-name">{pet.name}</div>
          </button>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .sheet-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 60;
    backdrop-filter: blur(2px);
  }

  .bottom-sheet {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--color-surface);
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    z-index: 61;
    padding-bottom: calc(40px + env(safe-area-inset-bottom, 0px));
    animation: slideUp 0.35s cubic-bezier(0.32, 0.72, 0, 1);
  }

  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  .sheet-handle {
    width: 36px;
    height: 4px;
    background: var(--color-border);
    border-radius: var(--radius-full);
    margin: var(--space-sm) auto var(--space-lg);
  }

  .sheet-content {
    padding: 0 var(--space-xl) var(--space-lg);
  }

  .sheet-question {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 700;
    color: var(--color-text-primary);
    margin-bottom: var(--space-xs);
  }

  .sheet-context {
    font-size: 13px;
    color: var(--color-text-muted);
    margin-bottom: var(--space-xl);
  }

  .animal-selector {
    display: flex;
    gap: var(--space-xl);
    justify-content: center;
  }

  .animal-pick {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
    cursor: pointer;
    background: none;
    border: none;
    -webkit-tap-highlight-color: transparent;
  }

  .pick-face {
    width: 72px;
    height: 72px;
    border-radius: 24px;
    background: linear-gradient(135deg, #ede9fe, #c4b5fd);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 38px;
    border: 3px solid transparent;
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    overflow: hidden;
  }

  .pick-face img { width: 100%; height: 100%; object-fit: cover; }

  .animal-pick:active .pick-face,
  .animal-pick.selected .pick-face {
    border-color: var(--color-primary);
    transform: scale(1.08);
    box-shadow: 0 4px 20px rgba(108, 92, 231, 0.25);
  }

  .pick-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text-primary);
  }
</style>
