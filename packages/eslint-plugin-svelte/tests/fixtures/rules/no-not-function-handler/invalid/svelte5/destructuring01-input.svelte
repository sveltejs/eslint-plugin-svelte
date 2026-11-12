<script>
	const obj = { h: 1 };
	const { h } = obj;
	const alias = obj;
</script>

<button onclick={h}>a</button>
<button onclick={alias}>b</button>
