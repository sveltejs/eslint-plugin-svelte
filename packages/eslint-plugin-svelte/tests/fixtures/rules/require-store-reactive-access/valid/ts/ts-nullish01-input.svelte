<script lang="ts">
	import { getContext } from 'svelte';
	import { type Readable, readable } from 'svelte/store';

	const fallback = readable({});

	export function getStore(): Readable<Record<string, unknown>> {
		return getContext('some_key') ?? readable({});
	}
	export function getStore2(): Readable<Record<string, unknown>> {
		const ctx = getContext<Readable<Record<string, unknown>>>('some_key');
		return ctx ?? fallback;
	}
</script>
