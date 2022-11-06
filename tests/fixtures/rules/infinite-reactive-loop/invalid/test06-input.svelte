<script>
  let a = 0

  const func = () => {
    return {
      then: (fun) => fun(),
      catch: (fun) => fun(),
    }
  }

  $: (() => {
    func().then(() => (a += 1))
    func().catch(() => (a += 1))
  })()
</script>
