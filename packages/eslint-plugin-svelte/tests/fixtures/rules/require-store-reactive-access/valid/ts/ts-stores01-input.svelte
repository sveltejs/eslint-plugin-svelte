<script lang="ts">
	import * as stores from '../../ts/store';
	import { get } from 'svelte/store';
</script>

<p>{get(stores.wStore)}</p>
<p>{get(stores.rStore)}</p>
<p>{get(stores.dStore)}</p>
<p>{get(stores.unionStore)}</p>
<p>{get(stores.storeLike)}</p>
<p>{get(stores.stores.w)}</p>
