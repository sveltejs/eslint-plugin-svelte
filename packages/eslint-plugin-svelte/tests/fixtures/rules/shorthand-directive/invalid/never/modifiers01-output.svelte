<script>
	let color = 'red';
	let width = '10px';
	let value = 'hello!';
	let active = true;
</script>

<div style:color|important={color}>a</div>
<div style:color|important={color} style:width={width}>b</div>
<div style:width|important={width} class:active={active}>c</div>
<input bind:value={value} style:color|important={color} />
