<script>
  let obj = { a: 0 }
  let foo = { obj: 1 }

  const doSomething = async () => {
    await fetchFromServer()
    foo.obj += 1
  }

  $: (async () => {
    console.log(obj)
    await doSomething()
    foo.obj += 1
  })()
</script>
