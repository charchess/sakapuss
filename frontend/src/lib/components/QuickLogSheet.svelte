<script lang="ts">
  import { getApiUrl } from '$lib/api';

  interface Pet {
    id: string;
    name: string;
    species: string;
    photo_url?: string;
  }

  interface LitterResource {
    id: string;
    name: string;
    color: string | null;
    tracking_mode: string | null;
  }

  interface BowlResource {
    id: string;
    name: string;
    location: string;
    capacity_g: number;
    bowl_type: string;
    current_product_id: string | null;
    fill_mode?: string; // 'flat' or 'precise'
  }

  interface FoodProduct {
    id: string;
    name: string;
    brand: string | null;
  }

  let {
    open = $bindable(false),
    action = '',
    pets = [] as Pet[],
    litterResources = [] as LitterResource[],
    bowlResources = [] as BowlResource[],
    foodProducts = [] as FoodProduct[],
    onLogged = (event: any) => {},
  } = $props();

  let selectedPetId = $state('');
  let isLogging = $state(false);

  // Litter state — using map for Svelte 5 reactivity
  let selectedLitterMap = $state<Record<string, boolean>>({});
  let litterWeights = $state<Record<string, string>>({});
  let globalWeight = $state('');
  let litterNote = $state('');

  // Bowl state — using object for Svelte 5 reactivity
  let selectedBowlMap = $state<Record<string, boolean>>({});
  let bowlAmounts = $state<Record<string, string>>({});
  let bowlProducts = $state<Record<string, string>>({});
  let bowlNote = $state('');

  function isBowlAction(): boolean {
    return action === 'food_serve';
  }

  const foodBowls = $derived(bowlResources.filter(b => b.bowl_type === 'food'));

  // Get unique locations
  const bowlLocations = $derived([...new Set(foodBowls.map(b => b.location || 'Autre'))]);

  function bowlsAt(location: string): BowlResource[] {
    return foodBowls.filter(b => (b.location || 'Autre') === location);
  }

  const selectedBowlIds = $derived(Object.keys(selectedBowlMap).filter(k => selectedBowlMap[k]));

  function toggleBowl(id: string) {
    selectedBowlMap = { ...selectedBowlMap, [id]: !selectedBowlMap[id] };
    if (selectedBowlMap[id]) {
      const bowl = bowlResources.find(b => b.id === id);
      bowlAmounts = { ...bowlAmounts, [id]: String(bowl?.capacity_g || 30) };
      if (bowl?.current_product_id) bowlProducts = { ...bowlProducts, [id]: bowl.current_product_id };
    } else {
      const { [id]: _a, ...restAmounts } = bowlAmounts;
      const { [id]: _p, ...restProducts } = bowlProducts;
      bowlAmounts = restAmounts;
      bowlProducts = restProducts;
    }
  }

  function getProductLabel(productId: string | null | undefined): string {
    if (!productId) return 'Aucun produit';
    const p = foodProducts.find(fp => fp.id === productId);
    return p ? (p.brand ? `${p.name} (${p.brand})` : p.name) : '?';
  }

  async function logBowlFill() {
    if (selectedBowlIds.length < 1 || isLogging) return;
    isLogging = true;

    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      for (const bowlId of [...selectedBowlIds]) {
        const bowl = bowlResources.find(b => b.id === bowlId);
        if (!bowl) continue;

        const amount = bowlAmounts[bowlId]
          ? parseFloat(bowlAmounts[bowlId])
          : bowl.capacity_g; // forfaitaire = capacity

        await fetch(`${getApiUrl()}/bowls/${bowlId}/fill`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            amount_g: amount,
            served_at: new Date().toISOString(),
            notes: bowlNote.trim() || null,
          }),
        });
      }
      open = false;
      onLogged({ type: 'food_serve', bowls: [...selectedBowlIds] });
    } finally {
      isLogging = false;
    }
  }

  function getSpeciesEmoji(species: string): string {
    if (species?.toLowerCase().includes('cat') || species?.toLowerCase().includes('chat')) return '🐱';
    if (species?.toLowerCase().includes('dog') || species?.toLowerCase().includes('chien')) return '🐶';
    return '🐾';
  }

  function isLitterAction(): boolean { return action === 'litter_clean'; }
  function isWeightAction(): boolean { return action === 'weight'; }
  function isMedicineAction(): boolean { return action === 'health_note'; }
  function isObservationAction(): boolean { return action === 'behavior'; }
  function isEventAction(): boolean { return action === 'custom'; }
  function isFormAction(): boolean { return isWeightAction() || isMedicineAction() || isObservationAction() || isEventAction(); }

  // Form action states
  let formWeight = $state('');
  let formMedicineName = $state('');
  let formNote = $state('');
  let formTags = $state<Record<string, boolean>>({});

  const behaviorTags = ['Vomissement', 'Diarrhée', 'Léthargie', 'Appétit élevé', 'Appétit faible', 'Soif excessive', 'Grattage', 'Éternuement', 'Agressivité', 'Se cache', 'Hyperactivité'];

  function getFormTitle(): string {
    if (isWeightAction()) return 'Pesée';
    if (isMedicineAction()) return 'Médicament';
    if (isObservationAction()) return 'Observation';
    return 'Événement';
  }

  async function logFormAction() {
    if (isLogging) return;
    isLogging = true;

    const petId = pets.length === 1 ? pets[0].id : selectedPetId || pets[0]?.id;
    if (!petId) { isLogging = false; return; }

    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let payload: Record<string, any> = {};

    if (isWeightAction()) {
      if (!formWeight) { isLogging = false; return; }
      payload = { value: parseFloat(formWeight), unit: 'kg' };
    } else if (isMedicineAction()) {
      payload = { name: formMedicineName.trim() || 'Médicament', note: formNote.trim() || null };
    } else if (isObservationAction()) {
      const tags = Object.keys(formTags).filter(k => formTags[k]);
      payload = { tags, note: formNote.trim() || null };
    } else {
      payload = { note: formNote.trim() || null };
    }

    try {
      const res = await fetch(`${getApiUrl()}/pets/${petId}/events`, {
        method: 'POST', headers,
        body: JSON.stringify({ type: action, payload, occurred_at: new Date().toISOString() }),
      });
      if (res.ok) {
        const event = await res.json();
        open = false;
        onLogged(event);
      }
    } finally {
      isLogging = false;
    }
  }

  // Determine weight mode from resource config
  const hasPerCaisseWeight = $derived(
    litterResources.some(lr => lr.tracking_mode === 'weight' || lr.tracking_mode === 'volume')
  );
  const hasGlobalWeight = $derived(
    litterResources.some(lr => lr.tracking_mode === 'global_weight')
  );

  const selectedBowlCount = $derived(selectedBowlIds.length);
  const selectedLitterCount = $derived(selectedLitterIds.length);

  // Reactive check for bowl selection (Svelte 5 needs this for .includes tracking)
  function isBowlSelected(id: string): boolean {
    // Access .length to create dependency
    void selectedBowlIds.length;
    return selectedBowlIds.indexOf(id) !== -1;
  }

  // Auto-select pet for form actions when single pet
  $effect(() => {
    if (open && isFormAction() && pets.length === 1 && !selectedPetId) {
      selectedPetId = pets[0].id;
    }
  });

  // Reset state when opening
  $effect(() => {
    if (open) {
      selectedLitterMap = {};
      litterWeights = {};
      globalWeight = '';
      litterNote = '';
      selectedBowlMap = {};
      bowlAmounts = {};
      bowlProducts = {};
      bowlNote = '';
      formWeight = '';
      formMedicineName = '';
      formNote = '';
      formTags = {};
      selectedPetId = '';
    }
  });

  const selectedLitterIds = $derived(Object.keys(selectedLitterMap).filter(k => selectedLitterMap[k]));

  function toggleLitter(id: string) {
    selectedLitterMap = { ...selectedLitterMap, [id]: !selectedLitterMap[id] };
  }

  function getUnit(lr: LitterResource): string {
    if (lr.tracking_mode === 'volume') return 'ml';
    return 'g';
  }

  async function logLitter() {
    if (selectedLitterIds.length < 1 || isLogging) return;
    isLogging = true;

    const petId = pets.length === 1 ? pets[0].id : selectedPetId || pets[0]?.id;
    if (!petId) { isLogging = false; return; }

    const resources = selectedLitterIds.map(id => ({
      id,
      weight_g: litterWeights[id] ? parseFloat(litterWeights[id]) : null,
    }));

    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${getApiUrl()}/pets/${petId}/events`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: 'litter_clean',
          occurred_at: new Date().toISOString(),
          payload: {
            resources,
            global_weight_g: globalWeight ? parseFloat(globalWeight) : null,
            note: litterNote.trim() || null,
          },
        }),
      });

      if (res.ok) {
        const event = await res.json();
        open = false;
        onLogged(event);
      }
    } finally {
      isLogging = false;
    }
  }

  async function logEvent(petId: string) {
    if (isLogging) return;
    isLogging = true;
    selectedPetId = petId;

    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${getApiUrl()}/pets/${petId}/events`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ type: action, payload: { status: 'ras' }, occurred_at: new Date().toISOString() }),
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

{#if open}
  <div class="sheet-backdrop" onclick={close} role="presentation"></div>

  <div class="bottom-sheet" role="dialog" aria-label="Quick Log">
    <div class="sheet-handle"></div>
    <div class="sheet-content">

      {#if isLitterAction() && litterResources.length > 0}
        <!-- ═══ LITTER FLOW — Single screen ═══ -->
        <div class="sheet-question">Caisse nettoyée</div>

        <!-- Litter icons — tap to toggle -->
        <div class="litter-grid">
          {#each litterResources as lr}
            {@const active = selectedLitterMap[lr.id]}
            <div class="litter-item">
              <button
                class="litter-icon"
                class:active
                style="--lr-color: {lr.color || 'var(--color-cat-litter)'}"
                onclick={() => toggleLitter(lr.id)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <path d="M12 3v5M8 5l1.5 3M16 5l-1.5 3"/>
                  <path d="M7 10h10l-1.5 8a2 2 0 01-2 1.5h-3a2 2 0 01-2-1.5L7 10z"/>
                </svg>
                <span>{lr.name}</span>
              </button>

              <!-- Per-caisse weight input (inline, only if active + tracking enabled) -->
              {#if active && hasPerCaisseWeight && lr.tracking_mode && lr.tracking_mode !== 'none' && lr.tracking_mode !== 'global_weight'}
                <div class="inline-weight">
                  <input
                    type="number"
                    step="1"
                    bind:value={litterWeights[lr.id]}
                    placeholder={getUnit(lr)}
                    class="weight-mini"
                  />
                  <span class="weight-unit">{getUnit(lr)}</span>
                </div>
              {/if}
            </div>
          {/each}
        </div>

        <!-- Global weight (if configured as global) -->
        {#if hasGlobalWeight && selectedLitterIds.length > 0}
          <div class="global-weight">
            <span class="gw-label">Poids total des déjections</span>
            <div class="gw-input">
              <input type="number" step="1" bind:value={globalWeight} placeholder="0" class="weight-mini" />
              <span class="weight-unit">g</span>
            </div>
          </div>
        {/if}

        <!-- Note — always visible, discreet -->
        {#if selectedLitterIds.length > 0}
          <input
            type="text"
            bind:value={litterNote}
            placeholder="Note (optionnel)"
            class="note-input"
          />
        {/if}

        <!-- Action button -->
        <button
          class="btn-log"
          disabled={selectedLitterIds.length === 0 || isLogging}
          onclick={logLitter}
        >
          {isLogging ? 'Enregistrement...' : 'Enregistrer'}
        </button>

      {:else if isBowlAction() && foodBowls.length > 0}
        <!-- ═══ BOWL FILL FLOW ═══ -->
        <div class="sheet-question">Gamelle remplie</div>

        {#each bowlLocations as location}
          <div class="location-group">
            <span class="location-label">{location}</span>
            <div class="bowl-grid">
              {#each bowlsAt(location) as bowl (bowl.id)}
                <div class="bowl-item">
                  <!-- svelte-ignore a11y_click_events_have_key_events -->
                  <!-- svelte-ignore a11y_no_static_element_interactions -->
                  <div
                    class="bowl-icon"
                    class:active={selectedBowlMap[bowl.id]}
                    onclick={() => toggleBowl(bowl.id)}
                    role="button"
                    tabindex="0"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                      <path d="M4 12a8 8 0 0016 0"/><path d="M3 12h18"/>
                    </svg>
                    <span>{bowl.name}</span>
                  </div>

                  {#if selectedBowlMap[bowl.id]}
                    <div class="bowl-detail">
                      <select
                        bind:value={bowlProducts[bowl.id]}
                        class="product-select"
                      >
                        {#each foodProducts as fp}
                          <option value={fp.id}>{fp.brand ? `${fp.name} (${fp.brand})` : fp.name}</option>
                        {/each}
                        {#if foodProducts.length === 0}
                          <option value="">Aucun produit</option>
                        {/if}
                      </select>
                      <div class="amount-row">
                        <input
                          type="number" step="1"
                          bind:value={bowlAmounts[bowl.id]}
                          class="weight-mini"
                        />
                        <span class="weight-unit">g</span>
                      </div>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/each}

        {#if selectedBowlIds.length > 0}
          <input type="text" bind:value={bowlNote} placeholder="Note (optionnel)" class="note-input" />
        {/if}

        <button class="btn-log" disabled={selectedBowlIds.length < 1 || isLogging} onclick={logBowlFill}>
          {isLogging ? 'Enregistrement...' : 'Enregistrer'}
        </button>

      {:else if isFormAction()}
        <!-- ═══ FORM ACTIONS (weight, medicine, observation, event) ═══ -->
        <div class="sheet-question">{getFormTitle()}</div>

        {#if pets.length > 1 && !selectedPetId}
          <div class="sheet-context">Pour qui ?</div>
          <div class="animal-selector">
            {#each pets as pet}
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <div class="animal-pick" onclick={() => selectedPetId = pet.id} role="button" tabindex="0">
                <div class="pick-face">{getSpeciesEmoji(pet.species)}</div>
                <div class="pick-name">{pet.name}</div>
              </div>
            {/each}
          </div>
        {:else}

          {#if isWeightAction()}
            <!-- WEIGHT -->
            <div class="form-section">
              <div class="weight-big">
                <input type="number" step="0.01" bind:value={formWeight} placeholder="0.00" class="weight-input-lg" autofocus />
                <span class="weight-unit-lg">kg</span>
              </div>
            </div>

          {:else if isMedicineAction()}
            <!-- MEDICINE -->
            <div class="form-section">
              <input type="text" bind:value={formMedicineName} placeholder="Nom du médicament" class="form-input" />
              <input type="text" bind:value={formNote} placeholder="Note (optionnel)" class="form-input form-input-light" />
            </div>

          {:else if isObservationAction()}
            <!-- OBSERVATION — behavioral tags -->
            <div class="form-section">
              <div class="tags-grid">
                {#each behaviorTags as tag}
                  <!-- svelte-ignore a11y_click_events_have_key_events -->
                  <!-- svelte-ignore a11y_no_static_element_interactions -->
                  <div
                    class="tag-chip"
                    class:active={formTags[tag]}
                    onclick={() => formTags = { ...formTags, [tag]: !formTags[tag] }}
                    role="button"
                    tabindex="0"
                  >
                    {tag}
                  </div>
                {/each}
              </div>
              <input type="text" bind:value={formNote} placeholder="Note libre (optionnel)" class="form-input form-input-light" />
            </div>

          {:else}
            <!-- FREE EVENT -->
            <div class="form-section">
              <input type="text" bind:value={formNote} placeholder="Qu'est-ce qui s'est passé ?" class="form-input" />
            </div>
          {/if}

          <button class="btn-log" disabled={isLogging || (isWeightAction() && !formWeight)} onclick={logFormAction}>
            {isLogging ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        {/if}

      {:else if pets.length > 1}
        <!-- ═══ STANDARD MULTI-PET FLOW ═══ -->
        <div class="sheet-question">Pour qui ?</div>
        <div class="sheet-context">{action}</div>

        <div class="animal-selector">
          {#each pets as pet}
            <button
              class="animal-pick"
              class:selected={selectedPetId === pet.id}
              onclick={() => logEvent(pet.id)}
              disabled={isLogging}
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
      {/if}

    </div>
  </div>
{/if}

<style>
  .sheet-backdrop {
    position: fixed; inset: 0;
    background: rgba(0, 0, 0, 0.3); z-index: 60;
    backdrop-filter: blur(2px);
  }

  .bottom-sheet {
    position: fixed; bottom: 0; left: 0; right: 0;
    background: var(--color-surface);
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    z-index: 61;
    padding-bottom: calc(40px + env(safe-area-inset-bottom, 0px));
    animation: slideUp 0.35s cubic-bezier(0.32, 0.72, 0, 1);
    max-height: 80vh; overflow-y: auto;
  }

  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  .sheet-handle {
    width: 36px; height: 4px;
    background: var(--color-border); border-radius: var(--radius-full);
    margin: var(--space-sm) auto var(--space-lg);
  }

  .sheet-content { padding: 0 var(--space-xl) var(--space-lg); }

  .sheet-question {
    font-family: var(--font-display);
    font-size: 20px; font-weight: 700;
    color: var(--color-text-primary);
    margin-bottom: var(--space-lg);
  }
  .sheet-context {
    font-size: 13px; color: var(--color-text-muted);
    margin-bottom: var(--space-xl);
  }

  /* ═══ Litter grid ═══ */
  .litter-grid {
    display: flex; gap: var(--space-md);
    justify-content: center; flex-wrap: wrap;
    margin-bottom: var(--space-lg);
  }

  .litter-item {
    display: flex; flex-direction: column; align-items: center; gap: var(--space-xs);
  }

  .litter-icon {
    display: flex; flex-direction: column; align-items: center; gap: var(--space-sm);
    padding: var(--space-md); min-width: 85px;
    border: 2px solid var(--color-border); border-radius: var(--radius-xl);
    background: var(--color-surface); cursor: pointer;
    transition: all 0.2s; -webkit-tap-highlight-color: transparent;
    font-family: var(--font-default);
  }
  .litter-icon svg { width: 32px; height: 32px; stroke: var(--color-text-muted); transition: stroke 0.2s; }
  .litter-icon span { font-size: var(--text-xs); font-weight: 500; color: var(--color-text-secondary); }
  .litter-icon.active {
    border-color: var(--lr-color);
    background: color-mix(in srgb, var(--lr-color) 8%, var(--color-surface));
    box-shadow: 0 2px 12px color-mix(in srgb, var(--lr-color) 20%, transparent);
  }
  .litter-icon.active svg { stroke: var(--lr-color); }
  .litter-icon.active span { color: var(--lr-color); font-weight: 600; }
  .litter-icon:active { transform: scale(0.95); }

  /* Inline weight under active caisse */
  .inline-weight {
    display: flex; align-items: center; gap: var(--space-2xs);
    margin-top: var(--space-xs);
    animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; } }

  .weight-mini {
    width: 56px; padding: var(--space-xs) var(--space-sm);
    border: 1.5px solid var(--color-border); border-radius: var(--radius-md);
    font-size: var(--text-sm); text-align: center; font-family: var(--font-default);
  }
  .weight-mini:focus { outline: none; border-color: var(--color-primary-light); }
  .weight-mini::placeholder { color: var(--color-text-muted); }
  .weight-unit { font-size: var(--text-xs); color: var(--color-text-muted); }

  /* Global weight */
  .global-weight {
    display: flex; align-items: center; justify-content: space-between;
    padding: var(--space-md); background: var(--color-bg); border-radius: var(--radius-lg);
    margin-bottom: var(--space-md);
  }
  .gw-label { font-size: var(--text-sm); color: var(--color-text-secondary); }
  .gw-input { display: flex; align-items: center; gap: var(--space-xs); }

  /* Note */
  .note-input {
    width: 100%; padding: var(--space-md);
    border: 1.5px solid var(--color-border); border-radius: var(--radius-lg);
    font-size: var(--text-sm); font-family: var(--font-default);
    color: var(--color-text-primary); margin-bottom: var(--space-lg);
  }
  .note-input:focus { outline: none; border-color: var(--color-primary-light); }
  .note-input::placeholder { color: var(--color-text-muted); }

  /* Log button */
  .btn-log {
    width: 100%; padding: var(--space-lg); background: var(--color-primary); color: white;
    border: none; border-radius: var(--radius-lg); font-size: var(--text-md); font-weight: 600;
    cursor: pointer; font-family: var(--font-default); transition: opacity 0.15s;
  }
  .btn-log:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-log:active:not(:disabled) { transform: scale(0.98); }

  /* ═══ Bowl grid ═══ */
  .location-group { margin-bottom: var(--space-lg); }
  .location-label {
    display: block; font-size: var(--text-xs); font-weight: 600;
    color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px;
    margin-bottom: var(--space-sm);
  }
  .bowl-grid { display: flex; gap: var(--space-md); flex-wrap: wrap; }
  .bowl-item { display: flex; flex-direction: column; align-items: center; gap: var(--space-xs); }

  .bowl-icon {
    display: flex; flex-direction: column; align-items: center; gap: var(--space-sm);
    padding: var(--space-md); min-width: 80px;
    border: 2px solid var(--color-border); border-radius: var(--radius-xl);
    background: var(--color-surface); cursor: pointer;
    transition: all 0.2s; -webkit-tap-highlight-color: transparent;
    font-family: var(--font-default);
  }
  .bowl-icon svg { width: 28px; height: 28px; stroke: var(--color-text-muted); transition: stroke 0.2s; }
  .bowl-icon span { font-size: var(--text-xs); font-weight: 500; color: var(--color-text-secondary); }
  .bowl-icon.active {
    border-color: var(--color-cat-food);
    background: rgba(0, 206, 201, 0.06);
    box-shadow: 0 2px 12px rgba(0, 206, 201, 0.15);
  }
  .bowl-icon.active svg { stroke: var(--color-cat-food); }
  .bowl-icon.active span { color: var(--color-cat-food); font-weight: 600; }
  .bowl-icon:active { transform: scale(0.95); }

  .bowl-detail {
    display: flex; flex-direction: column; align-items: center; gap: var(--space-xs);
    animation: fadeIn 0.2s ease; max-width: 120px;
  }
  .product-select {
    width: 100%; padding: var(--space-2xs) var(--space-xs);
    border: 1px solid var(--color-border); border-radius: var(--radius-sm);
    font-size: 10px; font-family: var(--font-default);
    background: var(--color-surface); color: var(--color-text-secondary);
    text-overflow: ellipsis;
  }
  .amount-row { display: flex; align-items: center; gap: var(--space-2xs); }
  /* ═══ Form actions ═══ */
  .form-section { margin-bottom: var(--space-lg); }

  .weight-big {
    display: flex; align-items: baseline; justify-content: center; gap: var(--space-sm);
    padding: var(--space-xl) 0;
  }
  .weight-input-lg {
    width: 140px; padding: var(--space-md);
    border: none; border-bottom: 3px solid var(--color-primary);
    font-size: 48px; font-weight: 700; text-align: center;
    font-family: var(--font-display); color: var(--color-text-primary);
    background: transparent;
  }
  .weight-input-lg:focus { outline: none; border-bottom-color: var(--color-primary-light); }
  .weight-input-lg::placeholder { color: var(--color-border); }
  .weight-unit-lg { font-size: 24px; color: var(--color-text-muted); font-weight: 600; }

  .form-input {
    width: 100%; padding: var(--space-md);
    border: 1.5px solid var(--color-border); border-radius: var(--radius-lg);
    font-size: var(--text-md); font-family: var(--font-default);
    color: var(--color-text-primary); margin-bottom: var(--space-sm);
  }
  .form-input:focus { outline: none; border-color: var(--color-primary-light); }
  .form-input::placeholder { color: var(--color-text-muted); }
  .form-input-light { border-color: var(--color-bg); background: var(--color-bg); font-size: var(--text-sm); }

  .tags-grid {
    display: flex; flex-wrap: wrap; gap: var(--space-xs); margin-bottom: var(--space-md);
  }
  .tag-chip {
    padding: var(--space-xs) var(--space-md);
    border: 1.5px solid var(--color-border); border-radius: var(--radius-full);
    font-size: var(--text-xs); cursor: pointer; transition: all 0.15s;
    font-family: var(--font-default); user-select: none;
    -webkit-tap-highlight-color: transparent;
  }
  .tag-chip.active {
    border-color: var(--color-cat-behavior); background: rgba(162,155,254,0.1);
    color: var(--color-cat-behavior); font-weight: 600;
  }

  /* ═══ Standard animal selector ═══ */
  .animal-selector { display: flex; gap: var(--space-xl); justify-content: center; }
  .animal-pick {
    display: flex; flex-direction: column; align-items: center; gap: var(--space-sm);
    cursor: pointer; background: none; border: none; -webkit-tap-highlight-color: transparent;
  }
  .pick-face {
    width: 72px; height: 72px; border-radius: 24px;
    background: linear-gradient(135deg, #ede9fe, #c4b5fd);
    display: flex; align-items: center; justify-content: center; font-size: 38px;
    border: 3px solid transparent;
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); overflow: hidden;
  }
  .pick-face img { width: 100%; height: 100%; object-fit: cover; }
  .animal-pick:active .pick-face, .animal-pick.selected .pick-face {
    border-color: var(--color-primary); transform: scale(1.08);
    box-shadow: 0 4px 20px rgba(108, 92, 231, 0.25);
  }
  .pick-name { font-size: 15px; font-weight: 600; color: var(--color-text-primary); }
</style>
