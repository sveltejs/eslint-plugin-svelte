<script lang="ts">
	interface Props {
		required: string;
		optional?: number;
		optionalCallback?: () => void;
	}

	const props: Props = $props();
	console.log(props.required);
	if (props.optional !== undefined) {
		console.log(props.optional);
	}
	props.optionalCallback?.();
</script>
