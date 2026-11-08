<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	const list = [];
	list.push(user);
	list[0].name = 'foo';
</script>
