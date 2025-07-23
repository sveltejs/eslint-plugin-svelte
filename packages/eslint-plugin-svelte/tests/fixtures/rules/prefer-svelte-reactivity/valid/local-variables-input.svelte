<script>
	const foo = () => {
		const date = new Date();
		const map = new Map();
		const set = new Set();
		const url = new URL('https://svelte.dev/');
		const objectURL = URL.createObjectURL(new MediaSource());
		const urlSearchParams = new URLSearchParams();
		console.log({ date, map, set, url, objectURL, urlSearchParams });
	};
</script>

{foo()}
