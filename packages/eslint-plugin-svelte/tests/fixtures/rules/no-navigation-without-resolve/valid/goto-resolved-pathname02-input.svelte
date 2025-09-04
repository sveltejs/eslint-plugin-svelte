<script lang="ts">
	import type { ResolvedPathname } from '$app/types';

	import { goto } from '$app/navigation';

	function navigate(href: ResolvedPathname) {
		goto(href);
	}
</script>
