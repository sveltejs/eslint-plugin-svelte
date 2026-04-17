<script>
	import FancyInput from './FancyInput.svelte';

	let value = $state('');
	const handle = () => {};
</script>

<FancyInput on:commit={handle} bind:value={value} />
