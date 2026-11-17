<script>
	import Child from './Child.svelte';
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
</script>

<Child {...items} />
