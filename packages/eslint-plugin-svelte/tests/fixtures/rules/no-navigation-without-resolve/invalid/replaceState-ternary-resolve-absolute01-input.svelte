<script>
	import { resolve } from '$app/paths';
	import { replaceState } from '$app/navigation';

	const condition = true;

	replaceState(condition ? resolve('/foo') : 'https://example.com');
	replaceState(condition ? '' : 'https://example.com');
	replaceState(condition ? 'https://example.com' : 'https://other.com');
</script>
