<script>
  let foo = Math.random()
</script>

<div>
  {#if foo > 0.5}
    <svelte:self style="display:block" />
  {/if}
</div>
