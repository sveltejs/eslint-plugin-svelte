<script>
	let color = 'red';
	let width = '10px';
	let value = 'hello!';
	let active = true;
</script>

<div style:color|important>a</div>
<div style:color|important style:width>b</div>
<div style:width|important class:active>c</div>
<input bind:value style:color|important />
