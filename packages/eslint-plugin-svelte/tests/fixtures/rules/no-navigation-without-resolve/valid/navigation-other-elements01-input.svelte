<script>
	import Link from './Link.svelte';
</script>

<!-- Not navigation, or not checked by this rule. -->
<link rel="stylesheet" href="/style.css" />
<img src="/logo.png" alt="" />
<Link href="/about" />
<svelte:element this="a" href="/about">Click me!</svelte:element>
<div href="/about"></div>
<a {...{ href: '/about' }}>Click me!</a>
