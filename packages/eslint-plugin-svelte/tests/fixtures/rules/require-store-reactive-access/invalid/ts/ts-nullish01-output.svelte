<script lang="ts">
	import { writable } from 'svelte/store';

	const count = writable<number | null>(null);
	console.log($count ?? 0);
</script>
