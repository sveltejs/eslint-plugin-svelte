<script>
	const { ...rest } = { x: 1 };
	const [...items] = [1];
	const obj = { y: () => {}, z: 1 };
	const { y, ...others } = obj;
</script>

<button onclick={rest}>a</button>
<button onclick={items}>b</button>
<button onclick={others}>c</button>
<button onclick={y}>d</button>
