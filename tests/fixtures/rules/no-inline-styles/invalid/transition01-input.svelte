<script>
	import { fade, fly } from 'svelte/transition';
</script>

<span transition:fade>Hello World!</span>

<span transition:fly={{ y: 200, duration: 2000 }}>Hello World!</span>
