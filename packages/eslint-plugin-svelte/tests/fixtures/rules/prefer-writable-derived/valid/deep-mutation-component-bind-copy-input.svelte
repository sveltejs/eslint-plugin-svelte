<script>
	import Child from './Child.svelte';
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	let items = $derived(user.items.filter(Boolean));
</script>

<Child bind:items />
