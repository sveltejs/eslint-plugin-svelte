<script lang="ts">
	interface Props {
		a: string;
		b: number;
	}
	let { a, b }: Props = $props();
	console.log(a, b);
</script>
