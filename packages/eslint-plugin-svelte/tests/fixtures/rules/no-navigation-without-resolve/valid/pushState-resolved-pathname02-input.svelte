<script lang="ts">
	import type { ResolvedPathname } from '$app/types';

	import { pushState } from '$app/navigation';

	function navigate(href: ResolvedPathname) {
		pushState(href);
	}
</script>
