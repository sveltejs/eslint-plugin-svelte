<script lang="ts">
	// `outer` is passed (as `outer`), `gone` never is — report by the external name.
	let { outer: inner, gone } = $props();
</script>

<p>{inner}</p>
<p>{gone}</p>
