<script>
	import { resolve } from '$app/paths';

	let { href = '/default', other = $bindable('/bindable') } = $props();
	let state = $state('/state');
	const derived = $derived(Math.random() > 0.5 ? resolve('/') : '/derived');
	const derivedBy = $derived.by(() => '/derived-by');
	let reassigned = resolve('/');
	reassigned = '/reassigned';
	const nav = [
		{ label: 'Home', url: resolve('/') },
		{ label: 'About', url: '/about' }
	];
	const { url: destructured } = nav[1];
	const [, second] = ['/first', '/second'];
</script>

<a {href}>Click me!</a>
<a href={other}>Click me!</a>
<a href={state}>Click me!</a>
<a href={derived}>Click me!</a>
<a href={derivedBy}>Click me!</a>
<a href={reassigned}>Click me!</a>
<a href={destructured}>Click me!</a>
<a href={second}>Click me!</a>
{#each nav as item}
	<a href={item.url}>{item.label}</a>
{/each}
{#each nav as { url, label }}
	<a href={url}>{label}</a>
{/each}
{#each nav as item}
	{@const link = item.url}
	<a href={link}>{item.label}</a>
{/each}
