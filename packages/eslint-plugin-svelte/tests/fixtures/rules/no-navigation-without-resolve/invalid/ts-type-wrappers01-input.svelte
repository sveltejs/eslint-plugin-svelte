<script lang="ts">
	import { goto } from '$app/navigation';

	const notShallow = { shallow: false } as const;
	const paths = ['/foo'] as const;

	goto('', notShallow);
	goto('', { shallow: true, ...({ shallow: false } as const) });
	goto(paths[0]);
	goto('/foo' as string);
</script>

<a href={paths[0]}>Link</a>
