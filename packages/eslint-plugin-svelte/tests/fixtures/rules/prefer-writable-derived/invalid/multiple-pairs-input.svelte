<script>
	const { data } = $props();

	let a = $state(data.a);
	$effect(() => {
		a = data.a;
	});

	let b = $state(data.b);
	$effect(() => {
		b = data.b;
	});
	const names = $derived(b.items.map((item) => item.name));

	let c = $state(data.c);
	$effect(() => {
		c = data.c;
	});
	c = c.filter(Boolean);

	let d = $state(data.d);
	$effect(() => {
		d = data.d;
	});
	d.name = 'foo';
</script>

<p>{a.name} {names.join(', ')} {[...c].length} {d.name}</p>
