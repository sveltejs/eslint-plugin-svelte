<svelte:options runes />
<script>
	import { writable } from 'svelte/store';
	const store = writable({ foo: 1, key: 'foo' });
	let target = {};
</script>
<button onclick={() => {
	$store.foo = $store.foo + 1;
	target[$store.key] = 1;
	({ [$store.key]: target.foo } = {});
	[target.foo = $store.foo] = [];
	for (target.foo of [$store.foo]) {}
}}>Update</button>
