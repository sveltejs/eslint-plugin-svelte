<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Pathname } from '$app/types';
	import { HOME } from './_routes';

	interface Props {
		to: '/a' | '/b';
		pathname: Pathname;
	}

	const { to, pathname }: Props = $props();
	const links = { home: '/home' } as const;

	goto(to);
	goto(pathname);
	goto(links.home);
	goto(HOME);
</script>
