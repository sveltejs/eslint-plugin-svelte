<script>
	let a = true;
	let b = true;
	let c = true;
	let d = true;
</script>

<button class:a={a} class:not-a={!a}>foo</button>
<button class:no-b={!b} class:b={b}>foo</button>
<button class:c-eq-d={c === d}>foo</button>
<button class:c-not-eq-d={c !== d} class:c-eq-d={c === d}>foo</button>
