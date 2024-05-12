<script lang="ts">
  import type { Writable } from "svelte/store"
  import { writable } from "svelte/store"
  let a: Writable = writable(42)
</script>

{{ $a }}
