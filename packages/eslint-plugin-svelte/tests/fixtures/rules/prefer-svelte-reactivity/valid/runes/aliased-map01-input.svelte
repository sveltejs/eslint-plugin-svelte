<script>
  import { SvelteMap as Map } from "svelte/reactivity";

  const variable = new Map([[1, "one"], [2, "two"]]);
</script>

{variable}
