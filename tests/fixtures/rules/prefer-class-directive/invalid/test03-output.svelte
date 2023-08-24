<script>
	let a = true;
	let b = true;
	let c = ' ';
</script>

<button class:a={a}>foo</button>
<button class={a ? ` a ${b}` : ''}>foo</button>
<button class={a ? ` a ` : c}>foo</button>
