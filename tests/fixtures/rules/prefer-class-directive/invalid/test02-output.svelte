<script>
	let a = true;
	let b = true;
	let c = true;
	let d = true;
</script>

<button class="{a ? ' a ' : b ? ' b ' : ''} {d === true ? ' d' : ''}" class:c={c} class:no-c={!c}>foo</button>
