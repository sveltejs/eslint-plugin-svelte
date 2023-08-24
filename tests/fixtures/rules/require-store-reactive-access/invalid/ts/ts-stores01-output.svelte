<script lang="ts">
	import * as stores from '../../ts/store';
	import { get } from 'svelte/store';
</script>

<p>{stores.wStore}</p>
<p>{stores.rStore}</p>
<p>{stores.dStore}</p>
<p>{stores.unionStore}</p>
<p>{stores.storeLike}</p>
<p>{stores.stores.w}</p>
