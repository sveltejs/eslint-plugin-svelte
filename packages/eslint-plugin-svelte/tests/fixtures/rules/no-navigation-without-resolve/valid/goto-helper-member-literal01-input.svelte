<script lang="ts">
	import { goto } from '$app/navigation';

	function localizeAll<T>(o: T): T {
		return o;
	}

	const links = localizeAll({ home: '/a' } as const);
	const { about } = localizeAll({ about: '/b' } as const);
	goto(links.home);
	goto(about);
	goto(localizeAll({ c: '/c' } as const).c);
</script>
