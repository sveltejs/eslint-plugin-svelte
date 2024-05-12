<script>
	import { writable, readable, derived, get } from 'svelte/store';
	const storeValue1 = writable('hello');
	const storeValue2 = readable('hello');
	const storeValue3 = derived(storeValue1, () => {});
</script>

<!-- ✓ GOOD -->
<p>{$storeValue1}</p>
<p>{get(storeValue1)}</p>
<p>{$storeValue2}</p>
<p>{get(storeValue2)}</p>
<p>{$storeValue3}</p>
<p>{get(storeValue3)}</p>

<!-- ✗ BAD -->
<p>{$storeValue1}</p>
<p>{$storeValue2}</p>
<p>{$storeValue3}</p>
