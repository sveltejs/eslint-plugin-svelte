<script>
	import FancyList from './FancyList.svelte';
	const items = [1, 2, 3];
</script>

<FancyList {items}>
	<div id={item.id} slot="item" let:item>{item.text}</div>
	<p slot="footer" class="footer">Footer</p>
</FancyList>
