<script lang="ts">
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
</script>

<button onclick={() => (user!.name = 'foo')}>{user.name}</button>
<button onclick={() => (user as { items: number[] }).items.push(1)}>{user.name}</button>
