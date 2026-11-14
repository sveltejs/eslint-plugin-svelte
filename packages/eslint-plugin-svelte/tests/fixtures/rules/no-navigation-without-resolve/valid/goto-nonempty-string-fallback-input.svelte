<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  let { href }: { href: string } = $props();
  goto(href ?? '/unreachable');
  goto(('?' + href) || '/unreachable');
</script>
<a href={page.url.origin || '/unreachable'}>origin</a>
