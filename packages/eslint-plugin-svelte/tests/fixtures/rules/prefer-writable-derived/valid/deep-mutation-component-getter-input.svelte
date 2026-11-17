<script>
	import Child from './Child.svelte';
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
</script>

<Child getUser={() => user} />
