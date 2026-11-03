<script lang="ts">
	import type { Readable } from 'svelte/store';
	import type { Action } from 'svelte/action';
	import type { TransitionConfig } from 'svelte/transition';
	import type { AnimationConfig } from 'svelte/animate';

	// e.g. melt-ui builders: a store that is also an action
	type MeltElement = Readable<Record<string, unknown>> & Action<HTMLElement>;
	export let trigger: MeltElement;
	export let optionalTrigger: MeltElement | undefined;
	export let handler: Readable<number> & ((e: MouseEvent) => void);
	export let fade: Readable<number> & ((node: HTMLElement) => TransitionConfig);
	export let flip: Readable<number> &
		((node: HTMLElement, rects: { from: DOMRect; to: DOMRect }) => AnimationConfig);
	export let tag: Readable<number> & ((strings: TemplateStringsArray) => string);
	const list = [1, 2];

	trigger(document.body);
	trigger?.(document.body);
	tag`x`;
</script>

<button {...$trigger} use:trigger>open menu</button>
<button use:optionalTrigger>open menu</button>
<button on:click={handler}>click</button>
<div transition:fade></div>
<div in:fade out:fade></div>
{#each list as item (item)}
	<div animate:flip>{item}</div>
{/each}
