<script lang="ts">
	import { wStore, rStore, dStore, unionStore, storeLike, stores } from '../../ts/store';
	import { get } from 'svelte/store';
</script>

<!-- ✓ GOOD -->
<p>{$wStore}</p>
<p>{get(wStore)}</p>
<p>{$rStore}</p>
<p>{get(rStore)}</p>
<p>{$dStore}</p>
<p>{get(dStore)}</p>
<p>{$unionStore}</p>
<p>{get(unionStore)}</p>
<p>{$storeLike}</p>
<p>{get(storeLike)}</p>
<p>{get(stores.w)}</p>

<!-- ✗ BAD -->
<p>{$wStore}</p>
<p>{$rStore}</p>
<p>{$dStore}</p>
<p>{$unionStore}</p>
<p>{$storeLike}</p>
<p>{stores.w}</p>
