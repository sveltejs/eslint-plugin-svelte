<script lang="ts">
	import type { BaseProps } from './shared-types';
	interface Props extends BaseProps {
		age: number;
	}
	let { age }: Props = $props();
	console.log(age);
</script>
