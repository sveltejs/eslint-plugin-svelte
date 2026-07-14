<script lang="ts">
    let check1 = $state(true);
    let check2 = $state(true);
    let check3 = $state(true);
    let check4 = $state(true);

    let value = $state(true)
</script>

<input type="checkbox" bind:value />

<input type="checkbox" bind:value={check1} />
<input type="CHECKBOX" bind:value={check2} />
<input type={"checkbox"} bind:value={check3} />
<input type={"CHECKBOX"} bind:value={check4} />