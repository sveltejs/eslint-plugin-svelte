<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import * as p from '$app/paths';

	const r: typeof resolve = resolve;
	const { asset }: typeof p = p;

	goto(r('/a'));
	goto(asset('/b'));
	goto(p.asset('/c'));
</script>

<a href={p.asset('/d')}>d</a>
