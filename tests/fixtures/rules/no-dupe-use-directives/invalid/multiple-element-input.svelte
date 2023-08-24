<script>
	function foo() {}
</script>

<div use:foo use:foo>
	<div use:foo use:foo>
		<div use:foo />
		<div use:foo use:foo />
		<div use:foo />
		<div use:foo use:foo />
		<div use:foo />
	</div>
	<div use:foo>
		<div use:foo use:foo />
		<div use:foo />
		<div use:foo use:foo />
		<div use:foo />
		<div use:foo use:foo />
	</div>
</div>
