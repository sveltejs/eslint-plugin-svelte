<script>
	let attrs;
</script>

<div order-b {...attrs} order-c order-a />
<div a b {...attrs} c />
<div c {...attrs} b a />
<div h g f e order-b d {...attrs} c order-c b order-a a />
