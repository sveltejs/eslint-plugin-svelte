<script>
	import myVar from './my-variables';
	let mutableVar = 'hello';

	const immutableVar = 'hello';
	/* ✗ BAD */
	$: computed3 = fn1(immutableVar);
	$: computed4 = fn2();
	$: console.log(immutableVar);
	$: console.log(myVar);

	function fn1(v) {
		return `${v} ${v}`;
	}
	function fn2() {
		return `${mutableVar} ${mutableVar}`;
	}
</script>

<input bind:value={mutableVar} />
