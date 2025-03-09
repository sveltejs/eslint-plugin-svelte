<script lang="ts">
	interface Props {
		a: string;
		b: number;
	}
	let props: Props = $props();
	console.log(props.a, props.b);
</script>
