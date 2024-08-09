<script lang="ts">
let variable = {
    bar: 'baz'
};
</script>
<a href="foo/{{ invalid: 'invalid' }}">foo</a>
<a href="foo/{variable}">foo</a>