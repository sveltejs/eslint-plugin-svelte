<script lang="ts">
	import type { ResolvedPathname } from '$app/types';

	import { goto } from '$app/navigation';

	interface Props {
		one: ResolvedPathname | undefined;
		two: ResolvedPathname | null;
		three?: ResolvedPathname;
	}

	const { one, two, three }: Props = $props();

	goto(one);
	goto(two);
	goto(three);
</script>
