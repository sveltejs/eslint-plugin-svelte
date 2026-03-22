<script>
	import { resolve } from '$app/paths';
	import { pushState } from '$app/navigation';

	const condition = true;

	pushState(condition ? resolve('/foo') : 'https://example.com');
	pushState(condition ? '' : 'https://example.com');
	pushState(condition ? 'https://example.com' : 'https://other.com');
</script>
