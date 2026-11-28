<script>
  let w = "5px"
  let c = true
</script>

<!-- An earlier shorthand or longhand with a dynamic value: no fix -->
<div style="margin: 1px; margin-top: {w}">1</div>
<div style="margin-top: 1px; margin: {w}">2</div>
<div style="margin-top: 1px !important; margin: {w}">3</div>
<div style="margin: 1px; {c ? 'margin-top: 3px' : ''}">4</div>
<!-- Shorthands whose longhands have other names: no fix -->
<div style="row-gap: {w}; gap: 1px">5</div>
<div style="top: {w}; inset: 1px">6</div>
<div style="align-items: {w}; place-items: end">7</div>
<div style="margin-top: {w}; all: initial">8</div>
<!-- Physical and logical properties: no fix -->
<div style="margin-inline-start: {w}; margin-left: 1px">9</div>
<div style="width: {w}; inline-size: 1px">10</div>
<div style="border-top-left-radius: {w}; border-start-start-radius: 1px">11</div>
<div style="inset-inline-start: {w}; left: 1px">12</div>
