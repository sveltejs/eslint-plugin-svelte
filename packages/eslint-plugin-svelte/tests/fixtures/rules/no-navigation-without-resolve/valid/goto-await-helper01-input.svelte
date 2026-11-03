<script lang="ts">
	import { goto } from '$app/navigation';

	async function localize<T extends string>(h: T): Promise<T> {
		return h;
	}

	const href = await localize('/a');
	goto(href);
	goto(await localize('/a'));
</script>

{#await localize('/a') then href}
	<a {href}>A</a>
{/await}
