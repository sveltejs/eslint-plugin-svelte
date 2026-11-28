<script>
	let c = $state(true);
</script>

<div style="color: a /* c */ b;">1</div>
<div style='font-family: "Arial"'>2</div>
<div style={c ? "color: red !important" : ""}>3</div>
<div style="color: red; color: blue">4</div>
