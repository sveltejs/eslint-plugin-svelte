<script>
  import { setContext } from "svelte"

  setTimeout(() => {
    setContext("answer", 42)
  })
</script>
