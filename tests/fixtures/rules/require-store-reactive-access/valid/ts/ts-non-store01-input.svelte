<script lang="ts">
	import {
		numValue,
		strValue,
		anyValue,
		nullableValue,
		hasSubscribe1,
		hasSubscribe2,
		hasSubscribe3
	} from '../../ts/non-store';
	import { get } from 'svelte/store';
</script>

<!-- Non store -->
<p>{numValue}</p>
<p>{strValue}</p>
<p>{anyValue}</p>
<p>{nullableValue}</p>
<p>{hasSubscribe1}</p>
<p>{hasSubscribe2}</p>
<p>{hasSubscribe3}</p>
