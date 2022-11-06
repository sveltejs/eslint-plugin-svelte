<script>
  import { tick } from "svelte"
  const setTimeout2 = setTimeout
  const setInterval2 = setInterval
  const queueMicrotask2 = queueMicrotask
  const tick2 = tick
  let a = 0

  $: (() => {
    Promise.resolve().then(() => {
      a = a + 1
      a += 1
    })

    Promise.resolve().catch(() => {
      a = a + 1
    })
  })()

  $: {
    new Promise((resolve, reject) => {
      /** do something */
    })
      .then(() => {
        a = a + 1
      })
      .catch(() => {
        a = a + 1
      })
  }

  $: (() => {
    a = a + 1
    Promise.all([])
      .then(() => {
        a = a + 1
      })
      .catch(() => {
        a = a + 1
      })
    a = a + 1
  })()

  $: (async () => {
    a = a + 1
    await Promise.resolve()
    a = a + 1
  })()

  $: (async () => {
    a = a + 1
    await Promise2.resolve()
    a = a + 1
  })()

  $: (async () => {
    a = a + 1
    await doSomething()
    a = a + 1
  })()

  $: {
    setTimeout(() => {
      a = a + 1
    })
  }

  $: {
    setTimeout2(() => {
      a = a + 1
    })
  }

  $: {
    setInterval(() => {
      a = a + 1
    })
  }

  $: {
    setInterval2(() => {
      a = a + 1
    })
  }

  $: {
    queueMicrotask(() => {
      a = a + 1
    })
  }

  $: {
    queueMicrotask2(() => {
      a = a + 1
    })
  }

  $: {
    tick(() => {
      a = a + 1
    })
  }

  $: {
    tick2(() => {
      a = a + 1
    })
  }

  $: (async () => {
    await tick()
    a = a + 1
  })()

  $: (async () => {
    await tick2()
    a = a + 1
  })()
</script>
