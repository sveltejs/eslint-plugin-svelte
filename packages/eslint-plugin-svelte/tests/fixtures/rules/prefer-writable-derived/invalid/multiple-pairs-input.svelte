<script>
	const { data } = $props();
	const identity = (value) => value;
	function count(node) {
		return node.children ? node.children.map(count).length : 1;
	}
	function rename(value) {
		value.name = 'foo';
	}

	let a = $state(data.a);
	$effect(() => {
		a = data.a;
	});
	const x = identity(a);

	let b = $state(data.b);
	$effect(() => {
		b = data.b;
	});
	const y = identity(b);

	let c = $state(data.c);
	$effect(() => {
		c = data.c;
	});
	const total = $derived(count(c));
	c = c.filter(Boolean);

	let d = $state(data.d);
	$effect(() => {
		d = data.d;
	});
	rename(d);
</script>

<p>{x.name} {y.name} {total} {[...c].length}</p>
