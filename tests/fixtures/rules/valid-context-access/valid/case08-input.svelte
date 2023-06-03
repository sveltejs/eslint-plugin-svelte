<script>
  import { setContext, onMount } from "svelte"

  if (setContext("answer", 42)) {
    console.log("setContext")
  } else if (setContext("answer", 43)) {
    console.log("setContext")
  }

  switch (setContext("answer", 42)) {
    case 1:
      console.log("setContext")
      break
    case 2:
      console.log("setContext")
      break
    default:
      console.log("setContext")
  }

  const foo = setContext("answer", 42) ? "bar" : "baz"
</script>
