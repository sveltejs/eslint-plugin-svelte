<script>
	export let a = true;
	export let b = true;
	export let c = true;
	export let d = true;
	export let e = true;
</script>

<!-- ✗ BAD -->
{#if a || b}
	1
{:else if a}
	2
{/if}

{#if a}
	1
{:else if b}
	2
{:else if a || b}
	3
{/if}

{#if a}
	1
{:else if a && b}
	2
{/if}

{#if a && b}
	1
{:else if a && b && c}
	2
{/if}

{#if a || b}
	1
{:else if b && c}
	2
{/if}

{#if a}
	1
{:else if b && c}
	2
{:else if d && ((c && e && b) || a)}
	3
{/if}
