<script>
  import { writable, readable, derived } from "./unknown"
  const w = writable(false)
  const r = readable({})
  const d = derived([a, b], () => {}, false)
</script>
