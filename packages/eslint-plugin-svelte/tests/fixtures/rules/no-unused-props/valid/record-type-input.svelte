<script lang="ts">
	type Props = {
		metadata: Record<string, unknown>;
		settings: Record<string, boolean>;
	};

	const props: Props = $props();
	const value = props.metadata['key'];
	const enabled = props.settings['feature'];
</script>
