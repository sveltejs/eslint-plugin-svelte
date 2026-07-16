<script lang="ts">
	let check1 = $state(true);
	let check2 = $state(true);
	let check3 = $state(true);
	let check4 = $state(true);

	let value = $state(true);
</script>

<input type="checkbox" bind:checked={value} />

<input type="checkbox" bind:checked={check1} />
<input type="CHECKBOX" bind:checked={check2} />
<input type={'checkbox'} bind:checked={check3} />
<input type={'CHECKBOX'} bind:checked={check4} />
