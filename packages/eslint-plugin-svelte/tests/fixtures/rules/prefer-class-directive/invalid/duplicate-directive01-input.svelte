<script>
	let { a, b } = $props();
</script>

<div class={a ? 'x' : 'y'} class:y={b}>1</div>
<div class={a ? 'x' : 'x'}>2</div>
<div class={a ? 'x' : 'y'}>3</div>
