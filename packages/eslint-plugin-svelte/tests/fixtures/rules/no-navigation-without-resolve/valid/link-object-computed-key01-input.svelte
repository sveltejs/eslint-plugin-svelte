<script>
	import { resolve } from '$app/paths';

	const key = `${Math.random()}`;
	const o = { url: resolve('/ok'), [key]: '/bad' };
</script>

<a href={o.url}>Link</a>
