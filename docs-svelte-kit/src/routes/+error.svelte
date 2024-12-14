<script>
	import { base as baseUrl } from '$app/paths';
	import { page } from '$app/stores';

	$: ({
		status,
		error: { message }
	} = $page);
</script>

<h1>{status}</h1>
<blockquote>
	<p>{message}</p>
	<p>Take me <a href="{baseUrl}/">home</a></p>
</blockquote>
