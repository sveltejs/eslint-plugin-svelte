<script>
	if (globalThis.window instanceof Object) {
		console.log(location.href);
	} else {
		// console.log(location.href); // NG
	}
	if (globalThis.document instanceof Object) {
		console.log(location.href);
	} else {
		// console.log(location.href); // NG
	}
	if (globalThis.location instanceof Object) {
		console.log(location.href);
	} else {
		// console.log(location.href); // NG
	}
</script>
