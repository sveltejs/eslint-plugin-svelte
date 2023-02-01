<script lang="ts">
  import { createEventDispatcher } from "svelte"

  const dispatch1 = createEventDispatcher()
  const dispatch2 = createEventDispatcher<>()
</script>
