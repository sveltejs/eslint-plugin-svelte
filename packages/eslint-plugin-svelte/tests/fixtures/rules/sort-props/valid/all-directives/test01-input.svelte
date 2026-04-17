<script>
	import { fade } from 'svelte/transition';

	let isActive = $state(false);
	let value = $state('');
	const tooltip = () => {};
	const options = {};
</script>

<input
	class:active={isActive}
	style:color="red"
	bind:value
	aria-label="x"
	use:tooltip={options}
	transition:fade={{ duration: 200 }}
/>
