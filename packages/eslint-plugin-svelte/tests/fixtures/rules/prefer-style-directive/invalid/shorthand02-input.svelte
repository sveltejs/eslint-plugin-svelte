<script>
  let w = "5px"
</script>

<!-- An earlier shorthand or longhand with a static value keeps the same result -->
<div style="margin: {w}; margin-top: 1px">1</div>
<div style="margin-top: {w}; margin: 1px 2px">2</div>
<!-- Not related -->
<div style="color: {w}; text-align: center">3</div>
<div style="--a: {w}; --a-b: 1px">4</div>
<div style="margin-left: {w}" style:margin-top="1px">5</div>
<div style="margin-top: {w}; margin-left: 1px">6</div>
<div style="width: {w}; height: 1px">7</div>
<div style="font-size: {w}; width: 1px">8</div>
<div style="margin-inline-start: {w}; margin-block-end: 1px">9</div>
<div style="direction: {w}; all: initial">10</div>
