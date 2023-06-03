<script>
  import { setContext } from "svelte"

  Promise.resolve().then(() => {
    setContext("answer", 42)
  })

  Promise.resolve().then(function () {
    setContext("answer", 42)
  })

  Promise.resolve().catch(() => {
    setContext("answer", 42)
  })

  Promise.resolve().catch(function () {
    setContext("answer", 42)
  })
</script>
