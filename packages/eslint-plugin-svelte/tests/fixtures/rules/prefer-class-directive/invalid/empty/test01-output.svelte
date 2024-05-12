<script>
	let selected = 'foo';
	let children = 1;
</script>

<button class:selected={selected}>foo</button>
<button class="a b" class:selected={selected}>foo</button>
<button class="a b" class:selected={selected}>foo</button>

<div class="d-flex" class:gap-3={children > 1}>foo</div>
<div class="d-flex" class:gap-3={children !== 1}>foo</div>

<!-- test01-input.svelte -->
