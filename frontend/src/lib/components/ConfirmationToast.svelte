<script lang="ts">
  import { getApiUrl } from '$lib/api';

  let {
    visible = $bindable(false),
    event = null as any,
    onDismiss = () => {},
  } = $props();

  let expanded = $state<'note' | 'weight' | null>(null);
  let noteValue = $state('');
  let weightValue = $state('');
  let countdown = $state(true);

  // Auto-dismiss after 3 seconds
  let timer: ReturnType<typeof setTimeout>;

  $effect(() => {
    if (visible && countdown) {
      timer = setTimeout(() => {
        dismiss();
      }, 3000);
      return () => clearTimeout(timer);
    }
  });

  function dismiss() {
    visible = false;
    expanded = null;
    noteValue = '';
    weightValue = '';
    countdown = true;
    onDismiss();
  }

  function expandNote() {
    expanded = 'note';
    countdown = false;
    clearTimeout(timer);
  }

  function expandWeight() {
    expanded = 'weight';
    countdown = false;
    clearTimeout(timer);
  }

  async function saveNote() {
    if (event?.id && noteValue.trim()) {
      await fetch(`${getApiUrl()}/events/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...event, payload: { ...event.payload, note: noteValue.trim() } }),
      });
    }
    dismiss();
  }

  async function saveWeight() {
    if (event?.pet_id && weightValue) {
      await fetch(`${getApiUrl()}/pets/${event.pet_id}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'weight', payload: { value: parseFloat(weightValue), unit: 'kg' } }),
      });
    }
    dismiss();
  }

  async function undo() {
    if (event?.id) {
      await fetch(`${getApiUrl()}/events/${event.id}`, { method: 'DELETE' });
    }
    dismiss();
  }

  function formatTime(): string {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}h${now.getMinutes().toString().padStart(2, '0')}`;
  }
</script>

{#if visible}
  <div class="toast-wrap" role="status" aria-live="polite" data-testid="confirmation-toast">
    <div class="toast">
      <div class="toast-row">
        <div class="toast-icon">✓</div>
        <div class="toast-body">
          <div class="toast-msg">{event?.type || 'Noté !'}</div>
          <div class="toast-time" data-testid="toast-timestamp">{formatTime()}</div>
        </div>
      </div>

      {#if !expanded}
        <div class="toast-opts">
          <button class="toast-opt" onclick={expandNote} data-testid="toast-note">+ Note</button>
          <button class="toast-opt" onclick={expandWeight} data-testid="toast-weight">+ Poids</button>
          <button class="toast-opt toast-undo" onclick={undo} data-testid="toast-undo">Annuler</button>
        </div>
      {/if}

      {#if expanded === 'note'}
        <div class="toast-expand">
          <input
            class="toast-field"
            bind:value={noteValue}
            placeholder="Ajouter une note..."
            aria-label="Note"
            data-testid="toast-note-input"
          />
          <button class="toast-save" onclick={saveNote}>Enregistrer</button>
        </div>
      {/if}

      {#if expanded === 'weight'}
        <div class="toast-expand">
          <input
            class="toast-field"
            type="number"
            step="0.1"
            bind:value={weightValue}
            placeholder="0,0 kg"
            aria-label="Poids"
            data-testid="toast-weight-input"
          />
          <button class="toast-save" onclick={saveWeight}>Enregistrer</button>
        </div>
      {/if}

      {#if countdown}
        <div class="toast-bar" role="progressbar" aria-label="Fermeture automatique" aria-valuemin={0} aria-valuemax={100}></div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .toast-wrap {
    position: fixed;
    bottom: 88px;
    left: var(--space-lg);
    right: var(--space-lg);
    z-index: 55;
    animation: slideIn 0.35s cubic-bezier(0.32, 0.72, 0, 1);
  }

  @keyframes slideIn {
    from { transform: translateY(16px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .toast {
    background: var(--color-surface);
    border-radius: var(--radius-xl);
    padding: var(--space-lg);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    position: relative;
    overflow: hidden;
  }

  .toast-row { display: flex; align-items: center; gap: var(--space-md); }

  .toast-icon {
    width: 40px;
    height: 40px;
    border-radius: 14px;
    background: linear-gradient(135deg, #d3f9d8, #00b894);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: white;
    flex-shrink: 0;
  }

  .toast-body { flex: 1; }
  .toast-msg { font-size: 15px; font-weight: 600; color: var(--color-text-primary); }
  .toast-time { font-size: 12px; color: var(--color-text-muted); }

  .toast-opts { display: flex; gap: var(--space-sm); margin-top: var(--space-md); }
  .toast-opt {
    flex: 1;
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-lg);
    background: var(--color-bg);
    border: none;
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-secondary);
    cursor: pointer;
    font-family: var(--font-default);
  }
  .toast-opt:active { background: var(--color-primary-soft); color: var(--color-primary); }
  .toast-undo { flex: 0; background: transparent; color: var(--color-text-muted); font-size: 12px; }

  .toast-expand { margin-top: var(--space-md); }
  .toast-field {
    width: 100%;
    padding: var(--space-md);
    background: var(--color-bg);
    border: 1.5px solid var(--color-border);
    border-radius: var(--radius-lg);
    font-size: 15px;
    font-family: var(--font-default);
    color: var(--color-text-primary);
    outline: none;
  }
  .toast-field:focus { border-color: var(--color-primary-light); }

  .toast-save {
    width: 100%;
    margin-top: var(--space-sm);
    padding: var(--space-md);
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--radius-lg);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    font-family: var(--font-default);
  }

  .toast-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
    width: 100%;
    animation: countdown 3s linear forwards;
    border-radius: 0 0 0 var(--radius-xl);
  }

  @keyframes countdown {
    from { width: 100%; }
    to { width: 0%; }
  }
</style>
