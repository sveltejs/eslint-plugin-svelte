<script>
	function foo() {}
	function bar() {}
	const param = {};
</script>

<div use:foo use:foo={param} />
<div use:foo={{ a: 42 }} use:bar={{ a: 42 }} />
<div use:foo={{ a: 42 }} use:foo={{ b: 42 }} />
<div use:bar={{ a: 42 }} use:bar={{ a: 42, b: 42 }} />
