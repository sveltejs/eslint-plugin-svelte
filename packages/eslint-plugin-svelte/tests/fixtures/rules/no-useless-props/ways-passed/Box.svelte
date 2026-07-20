<script lang="ts">
	// attr (attribute), bound (bind:), children (body), head (snippet) are all
	// "passed"; only `trulyUnused` is never supplied by any call site.
	let { attr, bound = $bindable(), children, head, trulyUnused } = $props();
</script>

{@render head?.()}
<p>{attr}{bound}{trulyUnused}</p>
{@render children?.()}
