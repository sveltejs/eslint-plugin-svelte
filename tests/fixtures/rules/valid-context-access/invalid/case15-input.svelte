<script>
  import { setContext, onMount } from "svelte"
  const doSomething = () => {
    setContext("answer", 42)
  }

  ;(async () => {
    await Promise.resolve()
    doSomething()
  })()
</script>
