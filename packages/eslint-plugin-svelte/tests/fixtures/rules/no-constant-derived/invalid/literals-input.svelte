<script>
	let count = $derived(0);
	let name = $derived('hello');
	let pattern = $derived(/a+/u);
	let empty = $derived(null);
	let nothing = $derived(undefined);
	let negative = $derived(-1);
	let label = $derived(`count: ${1 + 1}`);
	let flag = $derived(true ? 'a' : 'b');
</script>

{count}{name}{pattern}{empty}{nothing}{negative}{label}{flag}
