<script>
	import { resolve } from '$app/paths';
	import { pushState } from '$app/navigation';

	let { condition } = $props();

	pushState(condition ? resolve('/foo') : 'https://example.com');
	pushState(condition ? '' : 'https://example.com');
	pushState(condition ? 'https://example.com' : 'https://other.com');
</script>
