<script>
	let color = 'blue';
	let x = 12,
		y = 12;
	$: transformStyle = `transform: translate(${x}px, ${y}px)`;
	let pointerEvents = false;
	let key = 'color';
</script>

<!-- ✓ GOOD -->
<div style="font-size: 12px; color: {color}; transform: translate({x}px, {y}px);" />
<div style={pointerEvents === false ? 'pointer-events:none;' : ''} />

<!-- ✗ BAD -->
<div style="font-size: 12px; color: {color}; {transformStyle}" />
<div style:pointer-events={pointerEvents ? null : 'none'} />

<div style="font-size: 12px; /* comment */ color: {color};" />
<div style="font-size: 12px; {key}: red;" />
