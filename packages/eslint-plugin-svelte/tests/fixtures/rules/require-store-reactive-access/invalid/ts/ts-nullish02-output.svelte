<script lang="ts">
	import { writable, readable, type Readable } from 'svelte/store';

	export let prop: Readable<number>;
	const stores = { w: writable(0) };
	const created = writable(0);
	const alias = created;
	const { d } = { d: writable(0) };
	const wrapped = writable(0) as Readable<number>;
	console.log($prop ?? readable(0));
	console.log(stores.w ?? readable(0));
	console.log($created ?? readable(0));
	console.log($alias ?? readable(0));
	console.log($d ?? readable(0));
	console.log((created as Readable<number>) ?? readable(0));
	console.log($wrapped ?? readable(0));
	console.log(writable(0) ?? readable(0));
</script>
