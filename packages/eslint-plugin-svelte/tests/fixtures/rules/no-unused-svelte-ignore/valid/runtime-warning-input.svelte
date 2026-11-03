<script>
	import Child from './Child.svelte';
	let { value = $bindable(), obj, html } = $props();
	let state = $state({ fn: () => {} });

	function update() {
		// svelte-ignore ownership_invalid_mutation
		obj.count += 1;
	}

	// svelte-ignore state_snapshot_uncloneable
	const snapshot = $state.snapshot(state);
</script>

<!-- svelte-ignore ownership_invalid_binding -->
<Child bind:value />

<!-- svelte-ignore binding_property_non_reactive -->
<input bind:value={obj.name} />

<!-- svelte-ignore hydration_attribute_changed -->
<img src={html} alt="" />

<!-- svelte-ignore hydration_html_changed -->
{@html html}

<button onclick={update}>{snapshot}</button>
