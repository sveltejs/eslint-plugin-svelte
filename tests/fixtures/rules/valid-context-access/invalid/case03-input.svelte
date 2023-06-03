<script>
  import { setContext, onMount } from "svelte"
  const something = () => {
    setContext("answer", 42)
  }
</script>

<button on:click={() => something()}>Click Me</button>
