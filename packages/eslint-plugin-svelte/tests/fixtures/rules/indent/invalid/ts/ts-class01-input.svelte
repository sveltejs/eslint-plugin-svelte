<!-- prettier-ignore -->
<script lang="ts">
abstract
class
C
{
abstract f
:
boolean
abstract fn
(
a
)
:
boolean
}

class Foo {
constructor
(
protected a
: 
string
,
protected readonly b
: 
string
,
protected c
:
number
=
30
,
protected readonly d
:
boolean 
= 
false
) 
{
}
}

class Foo {
prop
:
number;
opt
?
:
number;
opt2
?
:
number
=
42;
}
</script>

<!--tests/fixtures/rules/indent/invalid/ts/ts-class01-input.svelte-->
