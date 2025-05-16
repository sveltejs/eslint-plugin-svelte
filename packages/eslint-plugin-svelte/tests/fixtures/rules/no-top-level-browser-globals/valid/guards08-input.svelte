<script>
	console.log(typeof location !== 'undefined' && location.href);
	// console.log(typeof location === 'undefined' && location.href); // NG
	console.log(globalThis.location && location.href);
	// console.log(globalThis.location || location.href); // NG
	console.log(globalThis.location?.href);
	// console.log(globalThis.location.href); // NG
</script>
