<script>
  import { setContext } from "svelte"

  const doSomething = () => {
    setTimeout(() => {
      setContext("answer", 42)
    })
  }

  doSomething()
</script>
