<script lang="ts">
	import type { Readable } from 'svelte/store';
	import type { Action } from 'svelte/action';
	import type { TransitionConfig } from 'svelte/transition';

	// e.g. melt-ui builders: a store that is also an action
	type MeltElement = Readable<Record<string, unknown>> & Action<HTMLElement>;
	export let trigger: MeltElement;
	export let optionalTrigger: MeltElement | undefined;
	export let handler: Readable<number> & ((e: MouseEvent) => void);
	export let onclick: Readable<number> & ((e: MouseEvent) => void);
	export let fade: Readable<number> & ((node: HTMLElement) => TransitionConfig);

	trigger(document.body);
	trigger?.(document.body);
</script>

<button {...$trigger} use:trigger>open menu</button>
<button use:optionalTrigger>open menu</button>
<button on:click={handler}>click</button>
<button onclick={handler}>click</button>
<button {onclick}>click</button>
<div transition:fade></div>
