<script>
	import FancyList from './FancyListFancyList.svelte';
	let items = [1, 2, 3];
</script>

<FancyList {items} let:a={thing} let:b={thing2}>
	<div>{thing.text}</div>
</FancyList>
