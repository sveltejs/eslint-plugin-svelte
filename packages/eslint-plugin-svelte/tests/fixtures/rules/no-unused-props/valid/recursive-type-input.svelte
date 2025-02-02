<script lang="ts">
	type RecursiveType = {
		value: string;
		children?: RecursiveType[];
	};

	const props: RecursiveType = $props();
	console.log(props.value, props.children?.[0]?.value);
</script>
