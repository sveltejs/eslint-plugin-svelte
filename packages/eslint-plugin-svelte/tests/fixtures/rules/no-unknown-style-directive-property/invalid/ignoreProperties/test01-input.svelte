<script>
	let red = 'red';
	let unknown = red;
	let foo = red;
	let bar = red;
</script>

<div style:unknown-color={red}>...</div>
<div style:unknown>...</div>
<div style:foo={red}>...</div>
<div style:foo>...</div>
<div style:bar={red}>...</div>
<div style:bar>...</div>
<div style:bar-foo={red}>...</div>
<div style:foo-bar={red}>...</div>
