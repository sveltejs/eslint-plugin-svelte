<script>
	let a = true;
	let b = true;
	let c = true;
	let d = true;
</script>

<button class:a-or-b={a || b} class:not-a-and-not-b={!(a || b)}>foo</button>
<button class:c-and-d={!(c && d)} class:not-c-and-d={c && d}>foo</button>
