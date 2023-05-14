<script>
  import { setContext, onMount } from "svelte"
  const something = () => {
    setContext("answer", 42)
  }

  something()
</script>
