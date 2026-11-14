<!-- prettier-ignore -->
<script>
    $: [, b, ...rest] = [];
    $: ({ c, d: e = 1, ...f } = {});
    $: [obj.x] = [];
    $: ({ g: obj.y } = {});
</script>
