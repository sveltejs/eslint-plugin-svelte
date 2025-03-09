<script lang="ts">
	interface Props {
		a: number;
		[key: string]: unknown;
	}

	let { a }: Props = $props();
</script>
