<script>
  import { SvelteSet as Set } from "svelte/reactivity";

  const variable = new Set([1, 2, 1, 3, 3]);
</script>

{variable}
