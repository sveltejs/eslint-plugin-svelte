<script>
	let red = 'red';
</script>

<div
	style="
    background: blue;
    {red ? `background-color: ${red}` : 'background-color: green'}
  "
>
	...
</div>
