<script lang="ts">
	const props: { config: { new (): any } } = $props();
	new props.config();
</script>
