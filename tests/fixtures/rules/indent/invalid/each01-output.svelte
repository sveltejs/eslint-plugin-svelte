<!-- prettier-ignore -->
<script>
  let cats = [
    { id: 'J---aiyznGQ', name: 'Keyboard Cat' },
    { id: 'z_AbfPXTKms', name: 'Maru' },
    { id: 'OUtn3pvWmpg', name: 'Henri The Existential Cat' }
  ];
</script>

<h1>The Famous Cats of YouTube</h1>

<!-- prettier-ignore -->
<ul>
  {#each cats as { id, name }, i}
    <li><a target="_blank" href="https://www.youtube.com/watch?v={id}">
      {i + 1}: {name}
    </a></li>
  {/each}
</ul>
<!-- prettier-ignore -->
<ul>
  {
    #each
      cats
      as
      {
        id,
        name
      }
      ,
      i
  }
    <li><a target="_blank" href="https://www.youtube.com/watch?v={id}">
      {i + 1}: {name}
    </a></li>
  {
    /each
  }
  {
    #each
      cats
      as
      c
      ,
      index
      (
        c
          .
          id
      )
  }
    {
      c
    }
    {
      index
    }
  {
    /each
  }
  {
    #each
      cats
      as
      cat
  }
    {cat.name}
  {
    :else
  }
    ...
  {
    /each
  }
</ul>

<!--tests/fixtures/rules/indent/invalid/each01-input.svelte-->
