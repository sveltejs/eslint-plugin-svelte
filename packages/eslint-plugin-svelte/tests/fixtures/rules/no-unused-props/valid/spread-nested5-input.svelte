<!--Test1.svelte-->
<script lang="ts">
	import Test from '$lib/Test.svelte';

	interface Props {
		a: string;
		b: {
			c: string;
			d: number;
		};
	}

	let props: Props = $props();

	console.log(...props);
</script>

<Test />
