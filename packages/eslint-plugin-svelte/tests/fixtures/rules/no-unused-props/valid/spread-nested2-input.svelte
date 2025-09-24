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

	let { a, b }: Props = $props();
</script>

<Test {a} {...b} />
