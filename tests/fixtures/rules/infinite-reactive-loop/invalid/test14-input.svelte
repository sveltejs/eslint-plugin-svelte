<script>
  let a = 0

  const fetch = () => new Promise((resolve) => setTimeout(resolve, 1000))

  const doSomething = async () => {
    await fetch()
  }

  $: (async () => {
    await doSomething()
    a += 1
  })()
</script>
