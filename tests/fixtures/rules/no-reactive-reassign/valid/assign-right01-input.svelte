<script>
  let object = 0
  $: reactiveValue = value * 2

  function handleClick() {
    let foo = reactiveValue
    console.log(foo)
  }
</script>

{reactiveValue}
