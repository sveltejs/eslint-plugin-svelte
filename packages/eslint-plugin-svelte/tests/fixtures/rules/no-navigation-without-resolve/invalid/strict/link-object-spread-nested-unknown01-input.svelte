<script>
	import { resolve } from '$app/paths';
	import { extra } from './extra.js';

	const o = { url: resolve('/ok'), ...{ ...extra } };
</script>

<a href={o.url}>Link</a>
