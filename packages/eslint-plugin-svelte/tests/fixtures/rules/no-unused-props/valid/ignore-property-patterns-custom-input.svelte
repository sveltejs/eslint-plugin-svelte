<script lang="ts">
	interface Props {
		foo: string;
		bar: string;
	}

	const { bar }: Props = $props();
</script>
