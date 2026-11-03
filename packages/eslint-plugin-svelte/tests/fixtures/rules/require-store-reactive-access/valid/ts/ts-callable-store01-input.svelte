<script lang="ts">
	import type { Readable } from 'svelte/store';
	import type { Action } from 'svelte/action';

	// e.g. melt-ui builders: a store that is also an action
	type MeltElement = Readable<Record<string, unknown>> & Action<HTMLElement>;
	export let trigger: MeltElement;

	function setup(node: HTMLElement) {
		trigger(node);
	}
</script>

<button {...$trigger} use:trigger>open menu</button>
<div use:setup></div>
