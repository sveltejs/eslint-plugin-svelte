<script>
  export let xs;
  export let ys;
  export let c;
</script>

{#each xs as x}
  <span>{x}</span>
{:else}
  <p class="a">none</p>
{/each}

{#if c}
  <p class="b">c</p>
{:else}
  <p>not c</p>
{/if}

{#if c}
  {#each ys as y}
    <span>{y}</span>
  {:else}
    <p class="c">none</p>
  {/each}
{/if}

<style>
  .a {
    color: red;
  }

  .b {
    color: blue;
  }

  .c {
    color: green;
  }
</style>
