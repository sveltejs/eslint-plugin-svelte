<script lang="ts">
	interface Props {
		toString: () => string;
	}
	let props: Props = $props();
	void props.valueOf;
</script>
