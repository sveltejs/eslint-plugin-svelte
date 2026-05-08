<script>
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';

	const condition = true;

	goto(condition ? resolve('/foo') : 'https://example.com');
	goto(condition ? 'https://example.com' : resolve('/foo'));
	goto(condition ? 'https://example.com' : 'https://other.com');
</script>
