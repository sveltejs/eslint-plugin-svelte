<script>
	import { writable } from 'svelte/store';
	let flag = writable(false);
	flag ||= true;
	flag &&= false;
	let count = writable(0);
	count ??= 1;
	let total = 0;
	total ||= count;
</script>
