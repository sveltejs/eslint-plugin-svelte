<script>
	import { resolve } from '$app/paths';

	const preResolved = resolve('/');
	const searchParams = new URLSearchParams();
	const query = searchParams.size ? '?' + searchParams : '';
	const qs = '?q=1';
</script>

<a href="?query=param">Click me!</a>
<a href="?{searchParams}">Click me!</a>
<a href={'?' + searchParams}>Click me!</a>
<a href="?{qs}/../other">Click me!</a>

<a href={preResolved}>Click me!</a>
<a href={preResolved + '?query=param'}>Click me!</a>
<a href="{preResolved}?query=param">Click me!</a>
<a href={preResolved + '?' + searchParams}>Click me!</a>
<a href="{preResolved}?{searchParams}">Click me!</a>
<a href={preResolved + query}>Click me!</a>
<a href="{preResolved}{query}">Click me!</a>

<a href={resolve('/') + '?query=param'}>Click me!</a>
<a href="{resolve('/')}?query=param">Click me!</a>
<a href={resolve('/') + '?' + searchParams}>Click me!</a>
<a href="{resolve('/')}?{searchParams}">Click me!</a>
<a href={resolve('/') + query}>Click me!</a>
<a href="{resolve('/')}{query}">Click me!</a>
<a href="{resolve('/')}#{'section'}">Click me!</a>
