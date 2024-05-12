<script>
	let color = 'blue';
	let x = 12,
		y = 12;
	$: transformStyle = `transform: translate(${x}px, ${y}px)`;
</script>

<!-- ✓ GOOD -->
<div style="font-size: 12px; color: {color}; transform: translate({x}px, {y}px);" />

<!-- ✗ BAD -->
<div not-style="font-size: 12px; color: {color}; {transformStyle}" />
