<script>
  import { setContext } from "svelte"

  const something = async () => {
    await Promise.resolve()
    setContext("answer", 42)
  }
  something()
</script>
