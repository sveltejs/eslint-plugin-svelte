<script>
	import * as util from './util.js';
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
</script>

<button onclick={() => util.reverse(items)}>reverse</button>
