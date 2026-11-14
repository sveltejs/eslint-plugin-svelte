<script>
	import { resolve } from '$app/paths';
	import { replaceState } from '$app/navigation';

	let { condition } = $props();

	replaceState(condition ? resolve('/foo') : 'https://example.com');
	replaceState(condition ? '' : 'https://example.com');
	replaceState(condition ? 'https://example.com' : 'https://other.com');
</script>
