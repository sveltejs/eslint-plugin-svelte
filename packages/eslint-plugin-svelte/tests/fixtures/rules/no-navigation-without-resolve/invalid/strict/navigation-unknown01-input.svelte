<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getUrl } from './links';

	interface Props {
		url: string;
		loose: any;
		query: string;
	}

	const { url, loose, query }: Props = $props();

	goto(url);
	goto(loose);
	goto(getUrl());
	goto(resolve('/search') + query);
	goto(location.origin + resolve('/foo'));
</script>

<a href={url}>Click me!</a>
<a href={resolve('/search') + query}>Click me!</a>
<a href="{resolve('/search')}{query}">Click me!</a>
