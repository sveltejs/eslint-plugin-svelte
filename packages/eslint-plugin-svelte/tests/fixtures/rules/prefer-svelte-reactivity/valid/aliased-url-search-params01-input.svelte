<script>
  import { SvelteURLSearchParams as URLSearchParams } from "svelte/reactivity";

  const variable = new URLSearchParams("foo=1&bar=2");
</script>

{variable}
