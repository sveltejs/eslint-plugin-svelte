<script>
  import { hasContext, onMount } from "svelte"

  onMount(() => {
    if (hasContext("answer")) {
      console.log("The answer exist")
    }
  })
</script>
