<script>
	$: prop = $$props.prop;
	$: type = $$restProps.type;
</script>

<Widget {prop} />
<input {type} />
