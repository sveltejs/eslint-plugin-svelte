<script>
  import { setContext, onMount } from "svelte"

  const something = (fn) => fn()
  something(() => setContext("answer", 42))
</script>
