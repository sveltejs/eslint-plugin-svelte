<script>
	let items = $derived([]);
	let config = $derived({ a: 1, b: [2, 3], ['c']: { d: null } });
	let handlers = $derived({
		onclick() {},
		get value() {
			return 1;
		}
	});
</script>

{items}{config}{handlers}
