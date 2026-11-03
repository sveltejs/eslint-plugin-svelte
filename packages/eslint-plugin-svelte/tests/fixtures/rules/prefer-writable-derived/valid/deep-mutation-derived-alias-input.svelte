<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	const items = $derived(user.items);
	const done = $derived.by(() => user.done);
</script>

<button onclick={() => items.push(1)}>{items.length}</button>
<button onclick={() => done.pop()}>{done.length}</button>
