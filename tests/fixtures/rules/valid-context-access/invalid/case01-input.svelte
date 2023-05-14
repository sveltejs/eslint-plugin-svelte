<script>
  import {
    setContext,
    getContext,
    hasContext,
    getAllContexts,
    onMount,
  } from "svelte"

  const update1 = () => {
    setContext("answer", 42)
    getContext("answer")
    hasContext("answer")
    getAllContexts()
  }

  const update2 = function () {
    setContext("answer", 42)
    getContext("answer")
    hasContext("answer")
    getAllContexts()
  }

  function update3() {
    setContext("answer", 42)
    getContext("answer")
    hasContext("answer")
    getAllContexts()
  }

  onMount(() => {
    update1()
    update2()
    update3()
  })
</script>
