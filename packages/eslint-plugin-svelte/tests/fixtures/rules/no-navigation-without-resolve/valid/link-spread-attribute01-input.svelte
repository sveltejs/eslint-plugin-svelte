<script>
	let { ...rest } = $props();
</script>

<a {...{ rel: 'external' }} href="/x">X</a>
<a {...rest} href="/y">Y</a>
<a href="/z" {...rest}>Z</a>
