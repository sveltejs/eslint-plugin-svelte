<script module>
	import { writable } from 'svelte/store';
	export const count = writable(0);
	console.log(count + 1);
</script>

<p>{count}</p>
