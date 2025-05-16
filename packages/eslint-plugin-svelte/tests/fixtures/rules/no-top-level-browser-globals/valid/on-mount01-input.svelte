<script>
	import { onMount } from 'svelte';

	onMount(() => {
		const a = window.localStorage.getItem('myCat');
		console.log(a);
	});
</script>
