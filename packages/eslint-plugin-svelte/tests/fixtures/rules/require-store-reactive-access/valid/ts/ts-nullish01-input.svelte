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
	export function getStore3(): Readable<Record<string, unknown>> {
		let ctx = getContext<Readable<Record<string, unknown>>>('some_key');
		ctx ??= readable({});
		return ctx;
	}
	export function getStore4(): Readable<Record<string, unknown>> {
		return (getContext('some_key') as Readable<Record<string, unknown>>) ?? readable({});
	}
	export function getStore5(): Readable<Record<string, unknown>> {
		return getContext('a') ?? getContext('b') ?? readable({});
	}
	class Ctx {
		get(): Readable<Record<string, unknown>> {
			return readable({});
		}
	}
	export function getStore6(ctx: Ctx): Readable<Record<string, unknown>> {
		return ctx?.get() ?? readable({});
	}
</script>
