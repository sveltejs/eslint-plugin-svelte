<script lang="ts">
	const { data }: { data: { user: { count?: number; name?: string } } } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
</script>

<button onclick={() => user.count!++}>a</button>
<button onclick={() => (user.count! += 1)}>b</button>
<button onclick={() => (user.name! = 'b')}>c</button>
<button onclick={() => ((user.name as string) = 'b')}>d</button>
<p>{user.count} {user.name}</p>
