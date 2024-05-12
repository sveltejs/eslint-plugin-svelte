<script>
	let selected = 'foo';
</script>

<button class={selected ? 'selected' : ''}>foo</button>
<button class="a {selected ? 'selected' : ''} b">foo</button>
<button class="a{selected ? ' selected ' : ' '}b">foo</button>

<!-- test01-input.svelte -->
