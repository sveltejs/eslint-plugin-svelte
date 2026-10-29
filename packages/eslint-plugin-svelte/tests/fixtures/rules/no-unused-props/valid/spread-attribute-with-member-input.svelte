<!--Test1.svelte-->
<script lang="ts">
	import Test from '$lib/Test.svelte';

	type Props = {
		app: { name: string; description: string };
	};
	const { app }: Props = $props();
</script>

<p>{app.name}</p>
<Test {...app} />
