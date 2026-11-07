<svelte:options runes />

<script>
	import { writable } from 'svelte/store';
	const store = writable({ foo: 1, nested: { value: 1 }, list: [1] });
</script>

<input bind:value={$store.foo} />
<input bind:value={$store.nested.value} />
<button onclick={() => {
	$store.foo = 2;
	$store.foo += 1;
	$store.foo++;
	--$store.foo;
	$store.nested.value++;
	delete $store.nested.value;
	[$store.foo] = [1];
	({ foo: $store.foo } = { foo: 1 });
	[$store.foo = 1] = [];
	[...$store.list] = [1];
	({ ...$store.nested } = { value: 1 });
	for ($store.foo of [1, 2]) {}
	for ($store.foo in { a: 1 }) {}
}}>Update</button>
