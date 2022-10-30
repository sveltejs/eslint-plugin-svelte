<script>
  import { readable, writable, derived } from "svelte/store"

  readable(false, (set) => set(true))
  readable(false, (set) => true)

  writable(false, (set) => set(true))
  writable(false, (set) => true)

  derived(a, ($a) => $a * 2)
  derived(
    a,
    ($a, set) => {
      setTimeout(() => set($a), 1000)
    },
    "one moment...",
  )
</script>
