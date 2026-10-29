<script>
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';

	const resolved = resolve('/foo');
	const query = '?foo=bar';

	goto(resolve('/foo') - '?foo=bar');
	goto(resolve('/foo') - '#section');
	goto(resolve('/foo') - '');
	goto(resolved - '?foo=bar');
	goto(resolve('/foo') - query);
	goto(resolve('/foo') + '?' - 'foo=bar');
	goto(resolve('/foo') - '?' + 'foo=bar');
	goto(resolve('/foo') + ('?' - 'foo=bar'));
</script>
