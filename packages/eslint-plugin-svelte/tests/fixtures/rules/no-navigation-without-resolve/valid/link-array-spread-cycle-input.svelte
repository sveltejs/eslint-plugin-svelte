<script>
  const links = [...links];
  const first = [...second];
  const second = [...first];
</script>
{#each links as href}<a {href}>self</a>{/each}
{#each first as href}<a {href}>mutual</a>{/each}
<a href={links[0]}>index</a>
