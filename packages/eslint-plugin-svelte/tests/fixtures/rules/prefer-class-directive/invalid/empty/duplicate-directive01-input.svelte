<script>
	let { a, b } = $props();
</script>

<div class={a ? '' : 'x'} class:x={b}>1</div>
<div class:x={b} class={a ? 'x' : ''}>2</div>
<div class="foo {a ? 'x' : ''}" class:x>3</div>
<div class="{a ? 'x' : ''} {b ? 'x' : ''}">4</div>
<div class={a ? '' : 'x'} class:y={b}>5</div>
