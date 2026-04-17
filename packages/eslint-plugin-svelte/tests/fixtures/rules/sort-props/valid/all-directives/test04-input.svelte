<script>
	import FancyList from './FancyList.svelte';

	const handle = () => {};
</script>

<FancyList on:commit={handle} let:item>
	<div>{item}</div>
</FancyList>