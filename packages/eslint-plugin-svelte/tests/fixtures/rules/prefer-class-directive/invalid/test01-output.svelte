<script>
	let selected = 'foo';
</script>

<button class:selected={selected}>foo</button>
<button class="a b" class:selected={selected}>foo</button>
<button class="a b" class:selected={selected}>foo</button>

<!-- test01-input.svelte -->
