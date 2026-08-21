<script>
	let foo = 'foo';
</script>

<div data-text="prefix {`foo${foo}`} suffix" />
<div data-text={foo ? `foo${foo}` : 'bar'} />
<div data-text={`prefix${/* comment */ foo}`} />
<div data-text={`line\n${foo}`} />
<div data-text={`prefix{${foo}`} />
<div style:color={`rgb(${foo})`} />
<div data-text={'prefix' + foo} />
<div data-text={`static`} />

<HyperMD
	value={`# ${foo}

Text goes here`}
/>
