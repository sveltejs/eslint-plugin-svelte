<script>
	let a = true;
	let b = true;
	let c = true;
	let d = true;
</script>

<button class={a && b && c ? 'a b c' : ' '}>foo</button>
<button class={d ? '??' : ' '}>foo</button>
