<script>
  import { setContext, onMount } from "svelte"
  const something = () => {
    something2()
    setContext("answer", 42)
  }

  const something2 = () => {
    something()
    setContext("answer", 42)
  }

  something()
  something2()
</script>
