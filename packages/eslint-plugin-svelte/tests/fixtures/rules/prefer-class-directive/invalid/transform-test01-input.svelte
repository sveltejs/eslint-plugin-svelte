<script>
	let a = true;
	let b = true;
	let c = true;
	let d = true;
</script>

<button class={a ? 'a' : 'not-a'}>foo</button>
<button class={!b ? 'no-b' : 'b'}>foo</button>
<button class={c === d ? 'c-eq-d' : ''}>foo</button>
<button class={c !== d ? 'c-not-eq-d' : 'c-eq-d'}>foo</button>
