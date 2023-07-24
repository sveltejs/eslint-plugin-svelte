<script>
  import { setContext, getContext, hasContext, getAllContexts } from "svelte"

  setContext("answer", 42)
  getContext("answer")
  hasContext("answer")
  getAllContexts()
</script>
