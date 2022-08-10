<!-- prettier-ignore -->
<script>
    $: info = foo.info
    $: bar = foo.something
    $: baz = foo.bar.baz
    $: qux = foo[bar]
    $: dux = foo.baz().bar
</script>
