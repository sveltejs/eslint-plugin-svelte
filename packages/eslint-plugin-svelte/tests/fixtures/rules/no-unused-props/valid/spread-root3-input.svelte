<script lang="ts">
	import Test from '$lib/Test.svelte';

	interface Props {
		a: string;
	}

	let props: Props = $props();

	console.log(...props);
</script>

<Test />
