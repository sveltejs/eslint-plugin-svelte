<script lang="ts">
	import type { FooDTO } from './shared-types';

	interface Props extends FooDTO {
		child1: string;
		child2: number;
	}

	let { foo, child1 }: Props = $props();
</script>
