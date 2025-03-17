<script lang="ts">
	interface Props {
		foo: string;
		bar: string;
	}

	const { foo, bar }: Props = $props();
</script>
