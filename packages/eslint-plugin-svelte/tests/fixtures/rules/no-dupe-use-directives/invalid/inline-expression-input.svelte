<script>
	function foo() {}
	function bar() {}
</script>

<button use:foo={() => console.log('foo')} use:foo={() => console.log('foo')} />

<button
	use:bar={() =>
		// foo
		console.log('foo')}
	use:bar={() =>
		console
			// bar
			.log('foo')}
/>
