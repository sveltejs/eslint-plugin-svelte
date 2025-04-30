<script lang="ts">
	type Props = {
		test: string;
		'aria-label'?: string;
	};

	const { 'aria-label': foo }: Props = $props();
</script>

{foo}
