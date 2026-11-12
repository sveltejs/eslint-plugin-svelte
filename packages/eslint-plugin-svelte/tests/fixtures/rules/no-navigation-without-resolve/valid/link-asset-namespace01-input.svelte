<script>
	import * as p from '$app/paths';
	import { asset as a } from '$app/paths';

	const { asset } = p;
	const href = p.asset('/g');
</script>

<a href={p.asset('/f')}>f</a>
<a href={a('/e')}>e</a>
<a href={asset('/d')}>d</a>
<a href={p['asset']('/c')}>c</a>
<a {href}>g</a>
