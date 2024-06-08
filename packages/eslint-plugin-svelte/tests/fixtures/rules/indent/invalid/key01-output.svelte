<!-- prettier-ignore -->
<script>
  let value = 42
  let Component = {}
</script>

<!-- prettier-ignore -->
<div>
  {#key value}
    <Component />
  {/key}

  {
    #key
      value
  }
    <Component />
  {
    /key
  }
</div>

<!--tests/fixtures/rules/indent/invalid/key01-input.svelte-->
