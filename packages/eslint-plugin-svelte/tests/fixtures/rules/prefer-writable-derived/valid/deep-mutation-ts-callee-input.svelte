<script lang="ts">
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	const rename = (value: { name: string }) => {
		value.name = 'foo';
	};
</script>

<button onclick={() => (rename as (value: { name: string }) => void)(user)}>{user.name}</button>
