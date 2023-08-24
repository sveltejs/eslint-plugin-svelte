<script lang="ts">
	import * as nonStore from '../../ts/non-store';
	import { get } from 'svelte/store';
</script>

<!-- Non store -->
<p>{nonStore.numValue}</p>
<p>{nonStore.strValue}</p>
<p>{nonStore.anyValue}</p>
<p>{nonStore.nullableValue}</p>
<p>{nonStore.hasSubscribe1}</p>
<p>{nonStore.hasSubscribe2}</p>
<p>{nonStore.hasSubscribe3}</p>
