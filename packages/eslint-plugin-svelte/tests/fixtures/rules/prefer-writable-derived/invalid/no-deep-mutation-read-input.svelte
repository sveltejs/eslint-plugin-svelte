<script>
	import Child from './Child.svelte';
	import { format } from './format.js';
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	const show = (u) => u.name;
</script>

{#each user.items as item (item.id)}
	<p>{item.name}</p>
{/each}
<p>{show(user)} {format(user)}</p>
<p>{user.items.map((item) => item.name).join(', ')}</p>
<p>{user.items.filter(Boolean).sort().length}</p>
<Child value={user} />
<input bind:value={user} />
