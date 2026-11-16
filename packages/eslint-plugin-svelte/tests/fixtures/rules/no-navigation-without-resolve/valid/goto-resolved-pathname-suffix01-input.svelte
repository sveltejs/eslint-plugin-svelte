<script lang="ts">
	import type { ResolvedPathname } from '$app/types';

	import { goto } from '$app/navigation';

	interface Props {
		href: ResolvedPathname;
	}

	const { href }: Props = $props();
	const searchParams = new URLSearchParams();
	const query = searchParams.size ? '?' + searchParams : '';

	goto(href + '?a=1');
	goto(`${href}#x`);
	goto(href + query);
	goto(`${href}${query}`);
</script>
