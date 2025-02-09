<script lang="ts">
	import type { BaseProps } from './shared-types';
	interface Props extends BaseProps {
		age: number;
	}
	let { name, age }: Props = $props();
	console.log(name, age);
</script>
