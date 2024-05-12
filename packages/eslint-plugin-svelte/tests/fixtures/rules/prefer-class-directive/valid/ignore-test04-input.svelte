<script>
	let a = true;
	let b = true;
	let c = true;
	let d = true;
</script>

<button class="{a ? ' a' : b ? ' b' : ' '}{c ? 'c' : 'no-c'}{d === true ? ' d' : ''}">foo</button>
