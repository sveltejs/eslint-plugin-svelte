<script>
	function myHandler() {}
	function foo() {}
	function bar() {}
</script>

<!-- ✓ GOOD -->
<button on:click on:click={myHandler} />
<button on:click={foo} on:click={bar} />
