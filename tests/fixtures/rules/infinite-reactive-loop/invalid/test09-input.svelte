<script>
  let a = 0

  $: {
    console.log(a)
    setTimeout(() => {
      a += 1
    })
    setInterval(() => {
      a += 1
    })
    queueMicrotask(() => {
      a += 1
    })
  }
</script>
