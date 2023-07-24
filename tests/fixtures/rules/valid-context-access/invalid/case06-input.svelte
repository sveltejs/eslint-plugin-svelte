<script>
  import { setContext, onMount } from "svelte"
  const something = () => {
    const inner = () => {
      setContext("answer", 42)
    }
    inner()
  }

  something()
</script>

{#if something()}
  <button>Click Me</button>
{/if}
