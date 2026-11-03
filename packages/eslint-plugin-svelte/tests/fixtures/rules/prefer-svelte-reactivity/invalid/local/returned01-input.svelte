<script>
	function createSet() {
		const set = new Set();
		set.add(1);
		return set;
	}

	function createMap() {
		const map = new Map();
		return { map, set: (k, v) => map.set(k, v) };
	}

	let outer;
	function assignOuter() {
		const url = new URL('https://svelte.dev');
		url.pathname = '/docs';
		outer = url;
	}

	const set = createSet();
	const { map } = createMap();
	assignOuter();
</script>

{set.size}
{map.size}
{outer}
