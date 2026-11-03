{#each boxes as box}
{const
area
=
box.width
*
box.height
}
{let
label
=
`${area} square pixels`
}

<p>{format(doubled)} ({label})</p>
{/each}
