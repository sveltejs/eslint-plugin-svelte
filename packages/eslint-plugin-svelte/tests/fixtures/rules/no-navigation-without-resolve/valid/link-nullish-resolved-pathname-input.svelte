<script lang="ts">
	import type { ResolvedPathname } from '$app/types';

	interface Props {
		one: ResolvedPathname | undefined;
		two: ResolvedPathname | null;
		three?: ResolvedPathname;
		href: ResolvedPathname| null;
	}

	const { one, two, three, href }: Props = $props();
</script>

<a href={one}>Click me!</a>
<a href={two}>Click me!</a>
<a href={three}>Click me!</a>
<a {href}>Click me!</a>
