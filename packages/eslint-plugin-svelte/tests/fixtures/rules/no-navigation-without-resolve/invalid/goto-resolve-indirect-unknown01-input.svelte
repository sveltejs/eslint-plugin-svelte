<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import * as p from '$app/paths';

	const other = { resolve: (x) => x };
	const r = Math.random() > 0.5 ? resolve : (x) => x;
	const { resolve: res } = Math.random() > 0.5 ? p : other;
	let { asset: as } = p;
	as = (x) => x;
	const a = b;
	const b = a;

	goto(r('/a'));
	goto(res('/b'));
	goto(as('/c'));
	goto(a('/d'));
</script>
