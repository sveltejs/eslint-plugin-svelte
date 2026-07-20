<script lang="ts">
	// No component renders <Page>; its props are framework-injected, so a
	// zero-call-site component is skipped entirely (never flagged).
	let { data, params } = $props();
</script>

<p>{data}{params}</p>
