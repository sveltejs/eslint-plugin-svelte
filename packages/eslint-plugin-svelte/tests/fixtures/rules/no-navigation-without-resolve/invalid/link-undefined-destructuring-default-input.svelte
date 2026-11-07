<script>
  const { href = '/bad' } = { href: undefined };
  const [arrayHref = '/bad'] = [undefined];
  const { href: missingHref = '/bad' } = {};
  const [holeHref = '/bad'] = [,];
  const { href: mixedHref = '/bad' } = { href: unknown ? null : undefined };
</script>
<a {href}>object</a>
<a href={arrayHref}>array</a>
<a href={missingHref}>missing</a>
<a href={holeHref}>hole</a>
<a href={mixedHref}>conditional</a>
