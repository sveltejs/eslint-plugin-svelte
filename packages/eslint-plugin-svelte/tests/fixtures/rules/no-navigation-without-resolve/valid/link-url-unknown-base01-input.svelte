<script>
	import { PUBLIC_DOCS_URL } from '$env/static/public';

	let { data } = $props();
	const docs = new URL('/guide', PUBLIC_DOCS_URL);
</script>

<a href={new URL('/guide', PUBLIC_DOCS_URL).href}>docs</a>
<a href={new URL(`/u/${data.id}`, data.apiOrigin)}>api</a>
<a href={docs.href}>docs</a>
<a href={docs.toString()}>docs</a>
