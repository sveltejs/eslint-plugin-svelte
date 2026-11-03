<script lang="ts">
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	function rename(value: { name: string }): void;
	function rename(value: { name: string }) {
		value.name = 'foo';
	}
	const getUser = (() => user) as () => { name: string };
</script>

<button onclick={() => rename(user)}>{user.name}</button>
<button onclick={() => (getUser().name = 'bar')}>{user.name}</button>
