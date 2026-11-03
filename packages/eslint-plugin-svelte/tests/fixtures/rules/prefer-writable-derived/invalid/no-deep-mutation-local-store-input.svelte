<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	const box = {};
	box.user = user;
	const list = [];
	list.push(user);
	const wrapper = { user };
</script>

<p>{box.user.name} {list[0].name} {wrapper.user.name}</p>
