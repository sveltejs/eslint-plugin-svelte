<script lang="ts">
	import type { ExtendedProps } from './shared-types';
	interface Props extends ExtendedProps {
		role: string;
	}
	let { name, age }: Props = $props();
	console.log(name, age);
</script>
