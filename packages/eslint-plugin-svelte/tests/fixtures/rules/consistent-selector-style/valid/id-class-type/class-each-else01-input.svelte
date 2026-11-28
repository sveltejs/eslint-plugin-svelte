<script>
  import Wrapper from "./Wrapper.svelte";

  export let xs;
</script>

{#each xs as x}
  <span class="a">{x}</span>
  {#each x.items as item}
    <span>{item}</span>
  {:else}
    <p class="b">none</p>
  {/each}
{:else}
  <p>none</p>
{/each}

<Wrapper>
  {#each xs as x}
    <span>{x}</span>
  {:else}
    <p class="c">none</p>
  {/each}
</Wrapper>

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
