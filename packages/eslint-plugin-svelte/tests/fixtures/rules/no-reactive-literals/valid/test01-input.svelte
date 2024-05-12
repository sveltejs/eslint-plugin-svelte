<!-- prettier-ignore -->
<script>
    $: foo = `${"bar"}baz`
    $: bar = [ "bar" ]
    $: baz = { qux : true }

    let qux;
    
    qux = 1;
    qux = [];
    qux = {};
</script>
