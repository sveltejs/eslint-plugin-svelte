<script>
  import { setContext, onMount } from "svelte"

  onMount(() => {
    setContext("answer", 42)
  })
</script>
