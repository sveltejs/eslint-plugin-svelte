<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	const sorted = $derived([...user.items].sort((a, b) => a.order - b.order).reverse());
	const words = $derived(user.name.split(' ').reverse().join(' '));
	function last() {
		const segments = user.path.split('/');
		return segments.pop();
	}
</script>

<p>{sorted.length} {words} {last()}</p>
