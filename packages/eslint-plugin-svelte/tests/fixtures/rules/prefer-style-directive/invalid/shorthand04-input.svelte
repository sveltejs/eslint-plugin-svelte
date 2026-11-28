<script>
  let w = "5px"
  let c = true
  let style = "margin: 1px"
  let name = "margin"
</script>

<!-- Vendor prefixes and legacy names of the same property: no fix -->
<div style="transform: {w}; -webkit-transform: none">1</div>
<div style="word-wrap: {w}; overflow-wrap: normal">2</div>
<div style="row-gap: {w}; grid-row-gap: 1px">3</div>
<div style="break-before: {w}; page-break-before: always">4</div>
<!-- Other shorthands: no fix -->
<div style="white-space: {w}; text-wrap: wrap">5</div>
<div style:contain-intrinsic-size="10px" style="contain-intrinsic-width: {w}">6</div>
<!-- Styles that can set any property: no fix -->
<div style="margin-top: {w}; {style}">7</div>
<div style="margin-top: {w}; {name}: 1px">8</div>
<div style="margin-top: {w}; {style || 'color: red'}">9</div>
<div style="margin-top: {w}; {`${style}`}">10</div>
<!-- Different properties: fix -->
<div style="margin-top: {w}; {c && 'color: red'}">11</div>
<div style="width: {w}; height: {w}">12</div>
<div style="top: {w}; left: {w}">13</div>
