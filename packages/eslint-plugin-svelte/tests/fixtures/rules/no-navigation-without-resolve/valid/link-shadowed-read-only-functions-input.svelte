<script>
  import { resolve } from '$app/paths';
  const obj = { href: '/bad' };
  function asset(x) { x.href = resolve('/ok'); }
  asset(obj);
  const other = { href: '/bad' };
  const Object = { keys(x) { x.href = resolve('/ok'); } };
  Object.keys(other);
</script>
<a href={obj.href}>local function</a>
<a href={other.href}>shadowed global</a>
