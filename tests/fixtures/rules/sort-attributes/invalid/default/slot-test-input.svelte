<script>
	import FancyList from './FancyList.svelte';
	const items = [1, 2, 3];
</script>

<FancyList {items}>
	<div id={item.id} let:item slot="item">{item.text}</div>
	<p class="footer" slot="footer">Footer</p>
</FancyList>
