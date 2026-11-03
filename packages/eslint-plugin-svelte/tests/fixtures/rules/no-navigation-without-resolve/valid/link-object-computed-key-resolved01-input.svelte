<script>
	import { resolve } from '$app/paths';

	const key = 'other';
	const o = { url: resolve('/ok'), [key]: '/bad' };
</script>

<a href={o.url}>Link</a>
