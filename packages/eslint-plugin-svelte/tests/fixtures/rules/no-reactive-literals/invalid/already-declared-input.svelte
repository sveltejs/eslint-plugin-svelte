<!-- prettier-ignore -->
<script>
    import imported from './x.js';
    export let prop = 0;
    let a = 0;
    let b;
    function fn() {}
    $: a = 1;
    $: prop = '';
    $: imported = [];
    $: fn = {};
    $: [b] = [];
    $: ({ c, d: a } = {});
    $: later = 1;
    let later;
    $: notDeclared = 1;
</script>

{a}{b}{c}{prop}{imported}{fn}{later}{notDeclared}
