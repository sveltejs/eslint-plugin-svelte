<script>
	import { goto } from '$app/navigation';
	import { resolve, asset } from '$app/paths';
	import * as p from '$app/paths';

	const r = resolve;
	const r2 = r;
	const { resolve: res, asset: as } = p;

	goto(asset('/a'));
	goto(p.asset('/b'));
	goto(r('/c'));
	goto(res('/d'));
	goto(r2('/e'));
	goto(as('/f'));
	goto(p['resolve']('/g'));
</script>
