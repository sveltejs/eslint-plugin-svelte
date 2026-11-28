<!-- prettier-ignore -->
<script>
    let a = 0;
    let obj = {};
    $: a += 1;
    $: obj.x = 1;
    $: obj['y'] = [];
    $: a ||= {};
    $: [b] = [];
    $: ({ c } = {});
</script>

{a}{obj.x}
