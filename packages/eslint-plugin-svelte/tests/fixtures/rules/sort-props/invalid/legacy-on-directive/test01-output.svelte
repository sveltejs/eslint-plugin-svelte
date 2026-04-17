<script>
	import FancyInput from './FancyInput.svelte';

	let value = $state('');
	const handle = () => {};
</script>

<FancyInput bind:value={value} on:commit={handle} />
