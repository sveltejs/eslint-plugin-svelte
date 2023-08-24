<script>
	function doSomething() {}
	function doSomething2() {
		function somethingElse() {}
	}
	(function () {
		function doSomething() {}
	})();
	if (test) {
		// eslint-disable-next-line no-var -- test
		var fn = function () {};
	}
	if (test) {
		// eslint-disable-next-line no-var -- test
		var fn = function expr() {};
	}
	function decl() {
		// eslint-disable-next-line no-var -- test
		var fn = function expr() {};
	}
	function decl2(arg) {
		// eslint-disable-next-line no-var -- test
		var fn;
		if (arg) {
			fn = function () {};
		}
	}
</script>
