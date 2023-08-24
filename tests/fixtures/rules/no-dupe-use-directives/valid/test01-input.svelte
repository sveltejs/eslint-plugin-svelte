<script>
	function clickOutside() {}
	const param = {};
	const foo = {};
	const bar = {};
</script>

<!-- ✓ GOOD -->
<div use:clickOutside use:clickOutside={param} />
<div use:clickOutside={foo} use:clickOutside={bar} />
