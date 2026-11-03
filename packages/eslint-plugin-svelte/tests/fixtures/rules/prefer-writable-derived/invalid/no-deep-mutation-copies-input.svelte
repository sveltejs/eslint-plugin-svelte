<script>
	import Child from './Child.svelte';
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	const sorted = $derived(user.items.toSorted());
	function add(name) {
		const names = user.items.map((item) => item.name);
		names.push(name);
		const [, ...rest] = user.items;
		rest.pop();
		const { id, ...others } = user;
		others.name = name;
		sorted.reverse();
	}
</script>

<button onclick={() => add('foo')}>{sorted.length}</button>
<Child bind:this={user} />
