<script>
	const { h } = { h: () => {} };
	const [g] = [() => {}];
	const {
		a: { b }
	} = { a: { b: () => {} } };
	const { ...rest } = { x: 1 };
	const [...items] = [1];
	const { n } = { n: 1 };
</script>

<button onclick={h}>a</button>
<button onclick={g}>b</button>
<button onclick={b}>c</button>
<button onclick={rest}>d</button>
<button onclick={items}>e</button>
<button onclick={n}>f</button>
