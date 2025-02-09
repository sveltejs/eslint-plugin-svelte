<script lang="ts">
	interface Props {
		a: number;
		[key: string]: unknown;
	}

	let { a, ...rest }: Props = $props();
	console.log(rest);
</script>
