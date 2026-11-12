<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import * as p from '$app/paths';

	const other = { resolve: (x) => x, asset: (x) => x };
	const { resolve: res } = other;
	let r = resolve;
	r = (x) => x;

	function f(resolve) {
		goto(resolve('/a'));
	}

	goto(res('/b'));
	goto(other.asset('/c'));
	goto(p.base + '/d');
	goto(p.assets + '/e');
	goto(r('/f'));
</script>
