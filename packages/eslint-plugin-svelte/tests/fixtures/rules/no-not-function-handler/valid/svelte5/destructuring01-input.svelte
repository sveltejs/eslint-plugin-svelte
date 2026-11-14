<script>
	const { h } = { h: () => {} };
	const [g] = [() => {}];
	const {
		a: { b }
	} = { a: { b: () => {} } };
	const { n } = { n: 1 };
	const [m] = [1];
</script>

<button onclick={h}>a</button>
<button onclick={g}>b</button>
<button onclick={b}>c</button>
<button onclick={n}>d</button>
<button onclick={m}>e</button>
