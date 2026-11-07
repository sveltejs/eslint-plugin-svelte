<script lang="ts">
	import { goto } from '$app/navigation';
	namespace NS {
		export const href = '/x';
	}
	import alias = NS.href;
	import cfg = require('./helpers');

	goto(alias);
</script>

<a href={cfg.base}>x</a>
