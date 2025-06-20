<script>
	import { browser } from '$app/environment';
</script>

{location.href}

{#if browser}
	{location.href} <!-- Client-side -->
{/if}

{#if !browser}
	{location.href} <!-- Server-side -->
{/if}

{#if browser}
	{location.href} <!-- Client-side -->
{:else}
	{location.href} <!-- Server-side -->
{/if}

{#if !browser}
	{location.href} <!-- Server-side -->
{:else}
	{location.href} <!-- Client-side -->
{/if}
