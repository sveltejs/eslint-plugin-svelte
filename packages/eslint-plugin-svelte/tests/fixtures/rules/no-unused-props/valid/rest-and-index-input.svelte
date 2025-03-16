<script lang="ts">
	interface Props {
		a: string;
		b: number;
		[key: string]: unknown;
	}
	let { a, ...otherProps }: Props = $props();
	console.log(a, otherProps);
</script>
