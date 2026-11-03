<script lang="ts">
	import { getContext } from 'svelte';
	import { type Readable, readable } from 'svelte/store';

	export function getStore(): Readable<Record<string, unknown>> {
		return getContext('some_key') ?? readable({});
	}
</script>
