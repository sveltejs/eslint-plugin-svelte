<script>
	import { resolve } from '$app/paths';

	const base = { url: resolve('/ok') };
	const o = { ...base };
</script>

<a href={o.url}>Link</a>
