<script lang="ts">
  let foo = false

  let bar: string | undefined = undefined
</script>

<button on:click={() => (foo = !foo)} />

{#if !foo}
  <div>{bar}</div>
{/if}

{#if !foo && bar}
  <div>{bar}</div>
{/if}
