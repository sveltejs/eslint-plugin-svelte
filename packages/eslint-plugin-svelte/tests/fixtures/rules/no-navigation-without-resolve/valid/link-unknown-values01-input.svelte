<script lang="ts">
	import { getUrl } from './links';
	import { href as importedHref } from './links';

	interface Props {
		url: string;
		data: { link: string; items: { href: string }[] };
		loose: any;
	}

	const { url, data, loose }: Props = $props();
	const computed = getUrl();
</script>

<!-- Values that the rule cannot see through are not reported by default. -->
<a href={url}>Click me!</a>
<a href={url} target="_blank">Click me!</a>
<a href={data.link}>Click me!</a>
<a href={loose}>Click me!</a>
<a href={computed}>Click me!</a>
<a href={importedHref}>Click me!</a>
<a href={getUrl()}>Click me!</a>
{#each data.items as item}
	<a href={item.href}>Click me!</a>
{/each}
{#snippet link(target: string)}
	<a href={target}>Click me!</a>
{/snippet}
