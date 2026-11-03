<script lang="ts">
	let text = $state('');
	let value = $state('');
</script>

<input type="text" bind:value />

<input type="text" bind:value={text} />
