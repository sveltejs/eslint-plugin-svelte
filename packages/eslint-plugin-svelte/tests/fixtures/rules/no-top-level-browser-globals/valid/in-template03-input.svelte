<script>
	import { browser } from '$app/environment';
</script>

{#if !browser}
	Server-side.
{:else}
	{location.href}
{/if}
