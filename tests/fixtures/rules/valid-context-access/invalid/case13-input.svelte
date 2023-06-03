<script>
  import { setContext } from "svelte"
  ;(async () => {
    await Promise.resolve()
    setContext("answer", 42)
  })()
</script>
