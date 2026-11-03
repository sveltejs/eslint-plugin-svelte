<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	const constructor = { log(value) {} };
	const text = $derived(toString.call(user) + hasOwnProperty.call(user, 'name'));
	const byId = $derived(
		user.items.reduce((acc, item) => {
			acc[item.id] = item.name;
			return acc;
		}, {})
	);
	function getUser() {
		return user;
	}
	function show(node, u) {
		node.textContent = u.name;
	}
</script>

<button onclick={() => constructor.log(user)}>{text} {byId}</button>
<p use:show={user}>{getUser().name}</p>
{#each user.items}
	<p>item</p>
{/each}
{#await user.promise then value}
	<input bind:value={value.name} />
{/await}
