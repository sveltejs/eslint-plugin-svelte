<script>
  const nil = null;
  const obj = { href: nil };
  const { href = '/bad' } = obj;
  const [arrayHref = '/bad'] = [null];
  const { href: nestedHref = '/bad' } = { href: unknown ? null : nil };
</script>
<a {href}>object</a>
<a href={arrayHref}>array</a>
<a href={nestedHref}>conditional</a>
