<script>
  import { setContext, onMount } from "svelte"
  const doSomething = () => {
    setContext("answer", 42)
  }

  onMount(() => {
    doSomething()
  })
</script>
