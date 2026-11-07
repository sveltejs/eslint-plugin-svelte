<script>
	import { goto } from '$app/navigation';

	let { start } = $props();
	let u = $state('https://example.com/docs/');
	function f() {
		u = new URL('/foo', u).href;
	}
	let v = start;
	function next() {
		v = new URL('../next', v).href;
		goto(v);
	}
</script>

<a href={u}>Docs</a>
