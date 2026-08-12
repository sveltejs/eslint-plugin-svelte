<script>
	let foo = 'foo';
	let bar = 'bar';
</script>

<Foo attr={`prefix${foo}`} />
<div data-text={`prefix${foo}${bar}`} />
<!-- prettier-ignore -->
<Foo attr="{`prefix${foo}`}" />
