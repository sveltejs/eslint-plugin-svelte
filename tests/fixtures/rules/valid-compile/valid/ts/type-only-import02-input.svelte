<script lang="ts">
  import { type Writable, writable } from "svelte/store"
  let a: Writable = writable(42)
</script>

{{ $a }}
