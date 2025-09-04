<script>
	import { browser, dev } from '$app/environment';
</script>

{#if !browser || !dev}
	<!-- (!(browser && dev))  -->
	<div>DEV</div>
{:else}
	<!-- (browser && dev) -->
	<div>{localStorage.getItem('myCat')}</div>
{/if}
