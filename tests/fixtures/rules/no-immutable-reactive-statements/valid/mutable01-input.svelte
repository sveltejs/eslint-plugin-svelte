<script>
	import myStore from './my-stores';
	import myVar from './my-variables';
	let mutableVar = 'hello';
	export let prop;
	/* ✓ GOOD */
	$: computed1 = `${mutableVar} ${mutableVar}`;
	$: computed2 = fn1(mutableVar);
	$: console.log(mutableVar);
	$: console.log(computed1);
	$: console.log($myStore);
	$: console.log(prop);

	function fn1(v) {
		return `${v} ${v}`;
	}
</script>

<input bind:value={mutableVar} />
