<script>
  import { setContext } from "svelte"
  const something = () => {
    setContext("answer", 42)
  }

  something()
</script>
