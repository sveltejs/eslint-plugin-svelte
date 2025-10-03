<script>
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';

	goto(resolve('/foo') + '?q=1');
	goto(`${resolve('/bar')}&p=2`);

	const base = resolve('/baz');
	goto(base + '#frag');
</script>


