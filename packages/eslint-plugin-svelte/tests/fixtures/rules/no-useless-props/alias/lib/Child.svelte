<script lang="ts">
	// Reached only through the `$lib` alias; the rule must resolve it so this call
	// site counts (`used` passed, `unused` flagged).
	let { used, unused } = $props();
</script>

<p>{used}</p>
<p>{unused}</p>
