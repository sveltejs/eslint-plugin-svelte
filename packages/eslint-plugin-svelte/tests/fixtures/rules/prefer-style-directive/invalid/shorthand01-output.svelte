<script>
  let w = "5px"
  let c = true
</script>

<!-- A later shorthand or longhand in the attribute: no fix -->
<div style="margin-top: {w};" style:margin="1px">1</div>
<div style="padding: {w};" style:padding-left="1px">2</div>
<div style="border-top: {w} solid;" style:border-width="2px">3</div>
<div style="font: {w} serif;" style:line-height="2">4</div>
<div style="margin-inline-start: {w};" style:Margin="1px">5</div>
<div style="margin-top: {w}; {c ? 'margin: 1px' : ''}">6</div>
<div style="{c ? 'margin-top: 3px' : ''}; margin: {w}">7</div>
<!-- A style directive for a shorthand or longhand: no fix -->
<div style:margin="1px" style="margin-top: {w}">8</div>
<div style="margin-top: {w}" style:margin="1px">9</div>
