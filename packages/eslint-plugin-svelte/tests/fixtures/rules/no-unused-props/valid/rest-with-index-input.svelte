<script lang="ts">
	interface Props {
		name: string;
		[key: string]: unknown;
	}
	let { name, ...rest }: Props = $props();
	console.log(name, rest);
</script>
