<script>
	import { base as baseUrl } from '$app/paths';
	import { page } from '$app/stores';
</script>

<h1>{$page.status}</h1>
<blockquote>
	<p>{$page.error.message}</p>
	<p>Take me <a href="{baseUrl}/">home</a></p>
</blockquote>
