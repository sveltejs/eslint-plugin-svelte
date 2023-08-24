<script>
	if (test) {
		function doSomething() {}
	}
	// eslint-disable-next-line no-var -- test
	if (foo) var a;
	// eslint-disable-next-line no-var -- test
	if (foo) /* some comments */ var a;
	if (foo) {
		function f() {
			if (bar) {
				// eslint-disable-next-line no-var -- test
				var a;
			}
		}
	}
	if (foo) {
		function f() {
			// eslint-disable-next-line no-var -- test
			if (bar) var a;
		}
	}
</script>
