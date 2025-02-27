<script lang="ts">
	interface Props {
		toString: () => string;
	}
	let props: Props = $props();
	console.log(props);
</script>
