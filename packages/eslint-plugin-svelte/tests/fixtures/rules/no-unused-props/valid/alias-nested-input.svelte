<script lang="ts">
	type Props = {
		app: { name: string; description: string };
	};
	const { app: a }: Props = $props();
</script>

<p>{a.name}{a.description}</p>
