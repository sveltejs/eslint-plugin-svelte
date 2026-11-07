<script>
	let { base } = $props();
	let current = $state();

	function createSet() {
		return new Set().add(1);
	}

	function createMap() {
		const map = new Map();
		return map.set('a', 1);
	}

	function reset() {
		current = new Map().set('a', 1);
	}

	function getParams() {
		const url = new URL(base);
		url.pathname = '/x';
		return url.searchParams;
	}

	function valueOf() {
		const url = new URL(base);
		url.pathname = '/x';
		return url.valueOf();
	}

	const set = createSet();
	const map = createMap();
	const params = getParams();
	const url = valueOf();
</script>

<button onclick={reset}>{set.size} {map.size} {current?.size} {params.get('q')} {url.href}</button>
