<script>
  let obj = { a: 0 }
  const doSomething = async () => {
    await fetchFromServer()
    obj.a += 1
  }

  $: (async () => {
    console.log(obj)
    await doSomething()
    obj.a += 1
  })()
</script>
