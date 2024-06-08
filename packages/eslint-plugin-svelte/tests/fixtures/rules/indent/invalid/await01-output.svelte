<!-- prettier-ignore -->
<script>
  let expression = Promise.resolve()
</script>

<!-- prettier-ignore -->
<div>
  {#await expression}
    ...
  {:then name}
    ...
  {:catch name}
    ...
  {/await}

  {#await expression}
    ...
  {:then name}
    ...
  {/await}

  {#await expression then name}
    ...
  {/await}

  {#await expression catch name}
    ...
  {/await}

  <!---->
  {
    #await
      expression
  }
    ...
  {
    :then
      name
  }
    ...
  {
    :catch
      name
  }
    ...
  {
    /await
  }

  {
    #await
      expression
  }
    ...
  {
    :then
      name
  }
    ...
  {
    /await
  }

  {
    #await
      expression
    then
      name
  }
    ...
  {
    /await
  }

  {
    #await
      expression
    catch
      name
  }
    ...
  {
    /await
  }
</div>

<!--tests/fixtures/rules/indent/invalid/await01-input.svelte-->
