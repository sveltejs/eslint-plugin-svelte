<script lang="ts">
	let selection = $state('cat');
</script>

<input type="radio" value="cat" bind:group={selection} />
<input type="radio" value="dog" bind:group={selection} />
<input type="radio" value="fish" bind:group={selection} />
{selection}
