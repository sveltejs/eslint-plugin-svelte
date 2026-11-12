<script>
	import { pushState, replaceState } from '$app/navigation';
	import * as p from '$app/paths';

	const r = p.resolve;

	pushState(p.asset('/a'), {});
	replaceState(r('/b'), {});
</script>
