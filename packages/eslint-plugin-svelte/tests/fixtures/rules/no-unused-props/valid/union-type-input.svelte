<script lang="ts">
	type Props = {
		status: 'success' | 'error' | 'loading';
		data: string | number;
	};

	const props: Props = $props();
	if (props.status === 'success') {
		console.log(props.data);
	}
</script>
