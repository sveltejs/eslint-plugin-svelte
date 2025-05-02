<script>
	if (globalThis.window !== undefined) {
		console.log(location.href);
	} else {
		console.log(location.href); // NG
	}
	if (globalThis.document !== undefined) {
		console.log(location.href);
	} else {
		console.log(location.href); // NG
	}
	if (globalThis.location !== undefined) {
		console.log(location.href);
	} else {
		console.log(location.href); // NG
	}
	if (globalThis.location === undefined) {
		console.log(location.href); // NG
	} else {
		console.log(location.href);
	}
	if (globalThis.location != undefined) {
		console.log(location.href);
	} else {
		console.log(location.href); // NG
	}
	if (globalThis.location == undefined) {
		console.log(location.href); // NG
	} else {
		console.log(location.href);
	}
	if (globalThis.location != null) {
		console.log(location.href);
	} else {
		console.log(location.href); // NG
	}
	if (globalThis.location == null) {
		console.log(location.href); // NG
	} else {
		console.log(location.href);
	}
	if (globalThis.location !== null) {
		// NG
		console.log(location.href); // NG
	} else {
		console.log(location.href); // NG
	}
	if (globalThis.location === null) {
		// NG
		console.log(location.href); // NG
	} else {
		console.log(location.href); // NG
	}
	if (undefined !== globalThis.window) {
		console.log(location.href);
	} else {
		console.log(location.href); // NG
	}
</script>
