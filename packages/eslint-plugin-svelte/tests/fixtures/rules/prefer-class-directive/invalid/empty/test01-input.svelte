<script>
	let selected = 'foo';
	let children = 1;
</script>

<button class={selected ? 'selected' : ''}>foo</button>
<button class="a {selected ? 'selected' : ''} b">foo</button>
<button class="a{selected ? ' selected ' : ' '}b">foo</button>

<div class="d-flex {children > 1 ? 'gap-3' : ''}">foo</div>
<div class="d-flex {children === 1 ? '' : 'gap-3'}">foo</div>

<!-- test01-input.svelte -->
