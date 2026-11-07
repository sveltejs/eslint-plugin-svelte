<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  let { href }: { href: string } = $props();
  goto(href || '/fallback');
  goto((href + '') || '/fallback');
  goto(base || '/fallback');
</script>
