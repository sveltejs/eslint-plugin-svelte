<script>
	import { writable, readable, derived } from './unknown';
	const w = writable();
	const r = readable();
	const d = derived([a, b], () => {});
</script>
