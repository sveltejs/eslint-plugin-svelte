<script>
  import { setContext, onMount } from "svelte"
  const something = () => {
    setContext("answer", 42)
  }

  const something2 = () => {
    something()
  }

  ;(() => {
    something()
    something2()
  })()
</script>
