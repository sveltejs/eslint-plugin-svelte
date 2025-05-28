<script>
  import { SvelteMap } from "svelte/reactivity";

  const variable = new SvelteMap([[1, "one"], [2, "two"]]);
</script>

{variable}
