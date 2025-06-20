<script>
	import { browser } from '$app/environment';
</script>

{#if browser}
	{location.href}
{/if}
