<script lang="ts">
	let leaked: unknown;
	function capture(this: unknown) {
		leaked = this;
		return '';
	}

	function typedHook() {
		const set = new Set();
		set.add(1);
		set.toString! = capture;
		String(set);
	}

	function typedURLHook() {
		const url = new URL('https://example.com');
		url.pathname = '/foo';
		(url.toJSON as () => string) = capture;
		JSON.stringify(url);
	}
</script>
