<!--Test1.svelte-->
<script lang="ts">
	import Test from '$lib/Test.svelte';

	interface Props {
		a: {
			c: string;
			d: number;
		};
	}

	let props: Props = $props();
</script>

<Test {...props.a} />
