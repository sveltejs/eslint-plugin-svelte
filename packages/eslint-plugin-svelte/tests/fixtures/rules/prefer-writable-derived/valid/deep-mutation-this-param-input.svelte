<script lang="ts">
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	function rename(this: unknown, u: { name: string }) {
		u.name = 'foo';
	}
</script>

<button onclick={() => rename(user)}>{user.name}</button>
