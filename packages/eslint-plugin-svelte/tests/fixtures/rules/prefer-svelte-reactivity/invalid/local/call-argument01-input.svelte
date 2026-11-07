<script>
	import { setContext } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';

	const groups = $state([]);
	const registry = new SvelteMap();

	function addGroup() {
		const set = new Set();
		set.add(1);
		groups.push(set);
	}

	function register(key) {
		const set = new Set();
		set.add(1);
		registry.set(key, set);
	}

	function provide() {
		const selected = new Set();
		selected.add(1);
		setContext('selected', selected);
	}

	function addDirect() {
		groups.push(new Set([1]).add(2));
	}

	provide();
</script>

<button onclick={addGroup}>{groups.length}</button>
<button onclick={() => register('a')}>{registry.size}</button>
<button onclick={addDirect}>add</button>
