<script lang="ts">
  import { goto } from '$app/navigation';
  let { href }: { href: string } = $props();
  goto(href || '/fallback');
  goto((href + '') || '/fallback');
</script>
