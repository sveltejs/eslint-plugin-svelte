<script lang="ts">
	type BaseDTO = {
		id: string;
		metadata: Record<string, unknown>;
	};

	type Props = BaseDTO & {
		name: string;
		description: string;
	};

	const props: Props = $props();
	console.log(props.id, props.name);
</script>
