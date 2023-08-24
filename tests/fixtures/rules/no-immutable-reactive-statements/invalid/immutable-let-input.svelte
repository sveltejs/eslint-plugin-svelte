<script>
	let immutableVar = 'hello';
	$: computed1 = `${immutableVar} ${immutableVar}`;
	$: computed1 = fn1(immutableVar);
	$: console.log(immutableVar);

	function fn1(v) {
		return `${v} ${v}`;
	}
</script>
