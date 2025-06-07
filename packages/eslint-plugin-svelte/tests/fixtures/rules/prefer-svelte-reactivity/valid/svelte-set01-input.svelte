<script>
  import { SvelteSet } from "svelte/reactivity";

  const variable = new SvelteSet([1, 2, 1, 3, 3]);
</script>

{variable}
