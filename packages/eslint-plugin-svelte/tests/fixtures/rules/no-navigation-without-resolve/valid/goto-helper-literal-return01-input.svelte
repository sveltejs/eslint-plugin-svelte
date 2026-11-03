<script lang="ts">
	import { goto } from '$app/navigation';

	function localizeHref<T extends string>(href: T): T {
		return href;
	}

	goto(localizeHref('/about'));
</script>

<a href={localizeHref('/about')}>About</a>
