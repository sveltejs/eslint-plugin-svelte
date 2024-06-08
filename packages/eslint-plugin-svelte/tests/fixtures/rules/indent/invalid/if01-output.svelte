<!-- prettier-ignore -->
<script>
  let a = 0
  let b = 0
</script>

<!-- prettier-ignore -->
<div>
  {#if a}
    <div></div>
  {/if}
  {
    #if
      a
  }
    <div></div>
  {
    /if
  }
  {
    #if
      a
  }
    <div></div>
  {
    :else
    if
      b
  }
    <div></div>
  {
    :else
  }
    <div></div>
  {
    /if
  }
</div>

<!--tests/fixtures/rules/indent/invalid/if01-input.svelte-->
