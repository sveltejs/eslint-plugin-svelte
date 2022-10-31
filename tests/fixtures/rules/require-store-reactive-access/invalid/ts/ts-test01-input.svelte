<script lang="ts">
  import { wStore, rStore, dStore } from "../../ts/store"
  import { get } from "svelte/store"
</script>

<!-- ✓ GOOD -->
<p>{$wStore}</p>
<p>{get(wStore)}</p>
<p>{$rStore}</p>
<p>{get(rStore)}</p>
<p>{$dStore}</p>
<p>{get(dStore)}</p>

<!-- ✗ BAD -->
<p>{wStore}</p>
<p>{rStore}</p>
<p>{dStore}</p>
