<!-- prettier-ignore -->
<script lang="ts">
interface A {
fn
?
(
a
:
string
)
:
number
}

interface B {
[
k
:
string
]
:
string[
];
}

interface C {
<
T
extends
U
>
(
e
:
E,
)
:
R
;
}

interface D {
new
(
arg
:
readonly
string[
]
)
:
void
;
}
</script>

<!--tests/fixtures/rules/indent/invalid/ts/ts-interface02-input.svelte-->
