<script lang="ts">
  import { getApiUrl } from '$lib/api';
  import { onMount } from 'svelte';

  let members = $state<any[]>([]);
  let householdId = $state('');
  let inviteEmail = $state('');
  let inviteRole = $state('input');
  let showInvite = $state(false);

  onMount(async () => {
    // For MVP: create household if none exists, list members
    const res = await fetch(`${getApiUrl()}/households`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Mon foyer' }) });
    if (res.ok) {
      const h = await res.json();
      householdId = h.id;
      const mRes = await fetch(`${getApiUrl()}/households/${h.id}/members`);
      if (mRes.ok) members = await mRes.json();
    }
  });

  async function sendInvite() {
    if (!inviteEmail || !householdId) return;
    const res = await fetch(`${getApiUrl()}/households/${householdId}/invitations`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    });
    if (res.ok) {
      const m = await res.json();
      members = [...members, m];
      inviteEmail = '';
      showInvite = false;
    }
  }

  const roleLabels: Record<string, string> = { admin: 'Total', input: 'Saisie', readonly: 'Consultation' };
</script>

<svelte:head><title>Foyer — Sakapuss</title></svelte:head>

<div class="household-page">
  <h1>Mon foyer</h1>

  <section class="members">
    <h2>Membres</h2>
    {#if members.length === 0}
      <p class="empty">Aucun membre invité</p>
    {:else}
      {#each members as m}
        <div class="member-card">
          <div class="member-avatar">{m.email[0].toUpperCase()}</div>
          <div class="member-info">
            <div class="member-email">{m.email}</div>
            <span class="member-role">{roleLabels[m.role] || m.role}</span>
            <span class="member-status" class:pending={m.status === 'pending'} class:active={m.status === 'active'}>{m.status}</span>
          </div>
        </div>
      {/each}
    {/if}
  </section>

  {#if !showInvite}
    <button class="btn-primary" onclick={() => showInvite = true}>+ Inviter un membre</button>
  {:else}
    <section class="invite-form">
      <h2>Inviter</h2>
      <input type="email" bind:value={inviteEmail} placeholder="email@exemple.fr" />
      <div class="role-selector">
        {#each ['admin', 'input', 'readonly'] as role}
          <label class="role-option" class:active={inviteRole === role}>
            <input type="radio" name="role" value={role} bind:group={inviteRole} />
            <strong>{roleLabels[role]}</strong>
            <span class="role-desc">
              {role === 'admin' ? 'Accès complet' : role === 'input' ? 'Saisie uniquement' : 'Lecture seule'}
            </span>
          </label>
        {/each}
      </div>
      <button class="btn-primary" onclick={sendInvite} disabled={!inviteEmail}>Envoyer</button>
    </section>
  {/if}
</div>

<style>
  .household-page { max-width: 500px; margin: 0 auto; padding: 52px var(--space-lg); }
  h1 { font-family: var(--font-display); margin-bottom: var(--space-xl); }
  h2 { font-size: var(--text-lg); margin-bottom: var(--space-md); }
  .members { margin-bottom: var(--space-xl); }
  .empty { color: var(--color-text-muted); }
  .member-card { display: flex; gap: var(--space-md); align-items: center; padding: var(--space-md); background: var(--color-surface); border-radius: var(--radius-lg); margin-bottom: var(--space-sm); box-shadow: var(--elevation-sm); }
  .member-avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--color-primary-light); display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; }
  .member-email { font-weight: 500; }
  .member-role { font-size: var(--text-xs); background: var(--color-primary-soft); color: var(--color-primary); padding: 2px 8px; border-radius: var(--radius-full); }
  .member-status { font-size: var(--text-xs); padding: 2px 8px; border-radius: var(--radius-full); }
  .member-status.pending { background: rgba(253,203,110,0.2); color: #b8860b; }
  .member-status.active { background: rgba(0,184,148,0.15); color: var(--color-success); }
  .invite-form { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-xl); box-shadow: var(--elevation-sm); }
  .invite-form input[type="email"] { width: 100%; padding: var(--space-md); border: 1.5px solid var(--color-border); border-radius: var(--radius-lg); font-size: var(--text-md); margin-bottom: var(--space-lg); font-family: var(--font-default); }
  .invite-form input[type="email"]:focus { outline: none; border-color: var(--color-primary-light); }
  .role-selector { display: flex; flex-direction: column; gap: var(--space-sm); margin-bottom: var(--space-lg); }
  .role-option { padding: var(--space-md); border: 1.5px solid var(--color-border); border-radius: var(--radius-lg); cursor: pointer; transition: all 0.2s; }
  .role-option.active { border-color: var(--color-primary); background: var(--color-primary-soft); }
  .role-option input { display: none; }
  .role-option strong { display: block; }
  .role-desc { font-size: var(--text-xs); color: var(--color-text-muted); }
  .btn-primary { width: 100%; padding: var(--space-md); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-size: var(--text-md); font-weight: 600; cursor: pointer; font-family: var(--font-default); }
  .btn-primary:disabled { opacity: 0.5; }
</style>
