<script>
	let red = 'red';
</script>

<div
	style="
    background: blue;
    {red ? `background: ${red}` : 'background: green'}
  "
>
	...
</div>
