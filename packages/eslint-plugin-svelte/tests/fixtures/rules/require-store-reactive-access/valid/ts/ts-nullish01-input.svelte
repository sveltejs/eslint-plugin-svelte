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
	export function getStore7(): Readable<Record<string, unknown>> {
		const ctx =
			getContext<Readable<Record<string, unknown>>>('a') ??
			getContext<Readable<Record<string, unknown>>>('b');
		return ctx ?? readable({});
	}
	export function getStore8(
		ctx = getContext<Readable<Record<string, unknown>>>('a')
	): Readable<Record<string, unknown>> {
		return ctx ?? readable({});
	}
	async function load(): Promise<Readable<Record<string, unknown>>> {
		return readable({});
	}
	export async function getStore9(): Promise<Readable<Record<string, unknown>>> {
		return (await load()) ?? readable({});
	}
	export function getStore10(): Readable<Record<string, unknown>> {
		return getContext<Readable<Record<string, unknown>>>('a')! ?? readable({});
	}
	export function getStore11(): Readable<Record<string, unknown>> {
		return (getContext('a') satisfies unknown as Readable<Record<string, unknown>>) ?? readable({});
	}
</script>
