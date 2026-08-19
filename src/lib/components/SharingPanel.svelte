<!-- SharingPanel.svelte -->
<script lang="ts">
  import {
    BOARD_MEMBER_ROLES,
    addBoardMember,
    boardMemberState,
    removeBoardMember,
    updateBoardMemberRole,
    type BoardMemberRole
  } from '$lib';

  let memberIdentity = '';
  let selectedRole: BoardMemberRole = 'viewer';

  async function submitMember() {
    if (!memberIdentity.trim()) return;

    await addBoardMember(memberIdentity, selectedRole);
    memberIdentity = '';
  }
</script>

<section class="sharing-panel">
  <form class="member-form" on:submit|preventDefault={submitMember}>
    <input
      type="text"
      placeholder="Email or user ID"
      bind:value={memberIdentity}
      disabled={$boardMemberState.status === 'saving'}
    />
    <select bind:value={selectedRole} disabled={$boardMemberState.status === 'saving'}>
      {#each BOARD_MEMBER_ROLES as role}
        <option value={role}>{role}</option>
      {/each}
    </select>
    <button type="submit" disabled={$boardMemberState.status === 'saving'}>Add</button>
  </form>

  {#if $boardMemberState.errorMessage}
    <div class="error">{$boardMemberState.errorMessage}</div>
  {/if}

  <ul>
    {#each $boardMemberState.members as member}
      <li>
        <span>{member.userEmail ?? member.userId}</span>
        <select
          value={member.role}
          disabled={$boardMemberState.status === 'saving'}
          on:change={(event) =>
            updateBoardMemberRole(member.id, (event.target as HTMLSelectElement).value as BoardMemberRole)}
        >
          {#each BOARD_MEMBER_ROLES as role}
            <option value={role}>{role}</option>
          {/each}
        </select>
        <button
          type="button"
          aria-label="Remove member"
          disabled={$boardMemberState.status === 'saving'}
          on:click={() => removeBoardMember(member.id)}
        >
          Remove
        </button>
      </li>
    {/each}
  </ul>
</section>

<style>
  .sharing-panel {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .member-form,
  li {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    gap: 0.5rem;
    align-items: center;
  }

  input,
  select,
  button {
    min-width: 0;
    padding: 0.35rem 0.5rem;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .error {
    color: #ff7777;
    font-size: 0.8rem;
  }
</style>
