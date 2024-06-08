<!-- prettier-ignore -->
<script lang="ts">
type T
=
U
|
null

type V =
T!

type A =
import
(
'foo'
)
.
B<
T
>
;
importFn
(
'foo'
)
.
B

function
foo
(
arg
:
readonly
string[
]
)
;
</script>

<!--tests/fixtures/rules/indent/invalid/ts/ts-types03-input.svelte-->
