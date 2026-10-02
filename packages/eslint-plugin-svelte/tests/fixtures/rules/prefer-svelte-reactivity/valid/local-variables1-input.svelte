<script>
	const foo = () => {
		const date = new Date();
		const map = new Map();
		const set = new Set();
		const url = new URL('https://svelte.dev/');
		const objectURL = URL.createObjectURL(new MediaSource());
		const urlSearchParams = new URLSearchParams();
		date.setDate(1);
		map.set('foo', 'bar');
		set.add('foo');
		url.pathname = '/foo';
		urlSearchParams.set('foo', 'bar');
		URL.revokeObjectURL(objectURL);
	};
</script>

{foo()}
