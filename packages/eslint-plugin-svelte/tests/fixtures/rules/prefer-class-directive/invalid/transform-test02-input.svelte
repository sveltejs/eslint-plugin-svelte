<script>
	let a = true;
	let b = true;
	let c = true;
	let d = true;
</script>

<button class={a || b ? 'a-or-b' : 'not-a-and-not-b'}>foo</button>
<button class={!(c && d) ? 'c-and-d' : 'not-c-and-d'}>foo</button>
