<script>
	import FancyList from './FancyListFancyList.svelte';
	let items = [1, 2, 3];
</script>

<FancyList let:a={thing} {items} let:b={thing2}>
	<div>{thing.text}</div>
</FancyList>

<FancyList let:a={thing} let:b={thing2} {items}>
	<div>{thing.text}</div>
</FancyList>

<FancyList {items} let:b={thing2} let:a={thing}>
	<div>{thing.text}</div>
</FancyList>
