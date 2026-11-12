<script>
	let c = true;
	let w = '1px';
	let font = 'Arial';
</script>

<!-- comments -->
<div style:color="a  b" style="width: 1px">1</div>
<div style:width="1px" style="color: /* x */ red">2</div>
<div style:color="{c ? 'red' : 'blue'}" style="/* y */">3</div>
<div style:color="a  {w}">4</div>

<!-- quotes -->
<div style:font-family="'Arial'">5</div>
<div style='font-family: "Arial", sans-serif;' style:width="1px">6</div>
<div style:color="{c ? "red" : "blue"}">7</div>
<div style='font-family: {font} "x"'>8</div>

<!-- !important -->
<div style:color|important={c ? "red" : null}>10</div>
<div style:color|important={c ? null : 'red'}>11</div>
<div style:width="1px" style="{c ? 'color: red !important' : ''}">12</div>
<div style="color: red !important">13</div>

<!-- duplicated properties -->
<div style="COLOR: red; color: blue">14</div>
<div style:--x="red" style="--X: blue">15</div>
<div style="color: red; color: blue" style:width="1px">16</div>
<div style="color: blue; {c ? 'color: red' : ''}">17</div>
<div style="{c ? 'color: red' : ''}; color: blue">18</div>
<div style="{c ? 'color: red' : ''}; {c ? '' : 'color: blue'}">19</div>
<div style="color: red; {c ? 'width: 1px' : 'color: blue'}">20</div>
