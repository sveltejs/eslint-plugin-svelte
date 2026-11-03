<script>
	import { writable } from 'svelte/store';
	const top = writable(0);
	function fn() {
		const local = writable(0);
		return [local + 1, $top + 1];
	}
</script>
