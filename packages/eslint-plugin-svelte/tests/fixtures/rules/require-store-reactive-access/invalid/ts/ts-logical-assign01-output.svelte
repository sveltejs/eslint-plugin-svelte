<script lang="ts">
	import { writable } from 'svelte/store';

	let count = writable<number | null>(null);
	let flag = writable(false);
	count ??= writable(0);
	flag ||= true;
	flag &&= false;
	let total = 0;
	total ||= $flag;
</script>
