<script lang="ts">
	interface Props {
		selected: { value: string };
	}

	let { selected = $bindable() }: Props = $props();
</script>

<input type="text" bind:value={selected.value} />
