<script lang="ts">
	import type { ResolvedPathname } from '$app/types';

	import { replaceState } from '$app/navigation';

	function navigate(href: ResolvedPathname) {
		replaceState(href);
	}
</script>
