<!-- prettier-ignore -->
<script lang="ts">
type a =
'a'
|
'b'
type b = 'a'
|
'b'

export
type A
=
|
B
.
C
|
D
|
Exclude<
E
,
{
foo
: F[
"g"
]
}
>
type H =
|
(
Exclude<
I
,
J
>
&
{
k
:
K
}
)
|
L
type M
<
T
extends
L
=
N
>
=
{
[
key
in
O
]
:
T extends
{
p
:
P
}
?
T
:
never
}
</script>

<!--tests/fixtures/rules/indent/invalid/ts/ts-types01-input.svelte-->
