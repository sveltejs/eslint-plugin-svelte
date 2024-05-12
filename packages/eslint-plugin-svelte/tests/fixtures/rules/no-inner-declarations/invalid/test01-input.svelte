<script>
	if (test) {
		function doSomething() {}
	}
	if (foo) var a;
	if (foo) /* some comments */ var a;
	if (foo) {
		function f() {
			if (bar) {
				var a;
			}
		}
	}
	if (foo) {
		function f() {
			if (bar) var a;
		}
	}
</script>
