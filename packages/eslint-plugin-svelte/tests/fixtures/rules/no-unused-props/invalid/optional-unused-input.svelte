<script lang="ts">
	interface Props {
		required: string;
		optional?: number;
		optionalCallback?: () => void;
		optionalData?: { value: string };
	}

	const props: Props = $props();
	console.log(props.required);
	if (props.optional !== undefined) {
		console.log(props.optional);
	}
</script>
