<script>
	export let foo;
	export let bar;
	export let { baz, qux } = data;
	export let { data: data2, errors: errors2 } = { data: {}, errors: {} };
</script>

{foo}, {bar}
