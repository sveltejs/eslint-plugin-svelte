<script>
  import { goto as navigate } from '$app/navigation';
  import * as navigation from '$app/navigation';
  import { resolve as path } from '$app/paths';
  import * as paths from '$app/paths';
  const obj = { href: '/bad' };
  Object.keys(obj);
  console.log(obj);
  const url = new URL('/bad', 'https://example.com');
  navigate(url);
  navigation.goto(url);
  path(obj.href);
  paths.resolve(obj.href);
</script>
<a href={obj.href}>object</a>
<a href={url}>url</a>
