<!-- prettier-ignore -->
<script lang="ts">
enum
A
{
a
,
b
}

const
enum
B
{
a
=
1
,
// [ Computed property names are not allowed in enums.
b
// ]
=
2
}
</script>

<!--tests/fixtures/rules/indent/invalid/ts/ts-enum01-input.svelte-->
