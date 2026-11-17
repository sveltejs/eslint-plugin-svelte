<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	const text = $derived(toString.call(user) + hasOwnProperty.call(user, 'name'));
	const constructor = { log(value) {} };
</script>

<button onclick={() => constructor.log(user)}>{text}</button>
