<script>
	import { browser, dev } from '$app/environment';
</script>

{#if browser && dev}
	<div>{localStorage.getItem('myCat')}</div>
{/if}
