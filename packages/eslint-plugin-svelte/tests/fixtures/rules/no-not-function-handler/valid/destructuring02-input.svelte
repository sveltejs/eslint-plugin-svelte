<script lang="ts">
	const { h }: { h: () => void } = { h: () => {} };
	const [g]: [() => void] = [() => {}];
</script>

<button on:click={h}>a</button>
<button on:click={g}>b</button>
