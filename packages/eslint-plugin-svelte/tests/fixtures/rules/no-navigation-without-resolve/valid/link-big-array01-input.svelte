<script>
	import { resolve } from '$app/paths';

	const l0 = [resolve('/a')];
	const l1 = [...l0, ...l0];
	const l2 = [...l1, ...l1];
	const l3 = [...l2, ...l2];
	const l4 = [...l3, ...l3];
	const l5 = [...l4, ...l4];
	const l6 = [...l5, ...l5];
	const l7 = [...l6, ...l6];
	const l8 = [...l7, ...l7];
	const l9 = [...l8, ...l8];
	const l10 = [...l9, ...l9];
	const l11 = [...l10, ...l10];
	const l12 = [...l11, ...l11];
	const l13 = [...l12, ...l12];
	const l14 = [...l13, ...l13];
	const l15 = [...l14, ...l14];
	const l16 = [...l15, ...l15];
	const l17 = [...l16, ...l16];
	const l18 = [...l17, ...l17];
	const l19 = [...l18, ...l18];
	const l20 = [...l19, ...l19];
</script>

{#each l20 as href, i (i)}
	<a {href}>Link</a>
{/each}
