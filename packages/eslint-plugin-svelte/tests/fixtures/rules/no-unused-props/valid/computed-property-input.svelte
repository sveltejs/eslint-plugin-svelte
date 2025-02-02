<script lang="ts">
	interface Props {
		dynamic: string;
	}
	const props: Props = $props();
	console.log(props['dynamic']);
</script>
