<script>
	let red = 'red';
</script>

<div style:background-repeat="repeat" style:background="green">...</div>
<div style:background-repeat="repeat" style:background={red}>...</div>
<div
	style="
    background-repeat: repeat;
    background: green;
  "
>
	...
</div>
<div
	style="
    background-repeat: repeat;
    background: {red};
  "
>
	...
</div>
<div style:background-repeat="repeat" style="background: green">...</div>
<div style:background-repeat="repeat" style="background: {red}">...</div>
