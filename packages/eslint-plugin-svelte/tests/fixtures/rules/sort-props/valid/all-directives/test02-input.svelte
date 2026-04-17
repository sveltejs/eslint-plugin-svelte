<script>
	import { fade, fly } from 'svelte/transition';
</script>

<div in:fly={{ x: 10 }} out:fade></div>