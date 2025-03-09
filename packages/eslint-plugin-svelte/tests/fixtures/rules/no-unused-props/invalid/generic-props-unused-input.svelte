<script lang="ts">
	import type { GenericProps } from './shared-types';
	interface Props extends GenericProps<string> {
		extra: boolean;
	}
	let { data, loading }: Props = $props();
	console.log(data, loading);
</script>
