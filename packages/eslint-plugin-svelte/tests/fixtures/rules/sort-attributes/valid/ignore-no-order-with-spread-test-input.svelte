<script>
	let attrs;
</script>

<div order-b {...attrs} order-a order-c />
<div a b {...attrs} c />
<div c {...attrs} b a />
<div h g f e order-b d {...attrs} c order-a order-c b a />
