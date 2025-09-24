<script>
	import { resolve } from '$app/paths';
	import { replaceState } from '$app/navigation';

	replaceState(resolve('/foo') + '?q=1');
	replaceState(`${resolve('/bar')}#frag`);

	const base = resolve('/baz');
	replaceState(base + '&x=1');
</script>
