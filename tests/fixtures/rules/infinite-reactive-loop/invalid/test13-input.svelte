<script>
  import { store } from "./store.js"

  const doSomething = () => {
    $store += 1
  }

  $: (async () => {
    console.log($store)
    await fetch()
    doSomething()
  })()
</script>
