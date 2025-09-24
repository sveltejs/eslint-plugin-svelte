<script>
	import { resolve } from '$app/paths';
	import { pushState } from '$app/navigation';

	pushState(resolve('/foo') + '?q=1');
	pushState(`${resolve('/bar')}#frag`);

	const base = resolve('/baz');
	pushState(base + '&x=1');
</script>
