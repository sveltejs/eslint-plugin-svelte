<script>
  import { SvelteURLSearchParams } from "svelte/reactivity";

  const variable = new SvelteURLSearchParams("foo=1&bar=2");
</script>

{variable}
