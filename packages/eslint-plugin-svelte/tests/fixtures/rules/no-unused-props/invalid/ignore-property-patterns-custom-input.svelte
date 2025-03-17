<script lang="ts">
	interface Props {
		foo: string;
		_foo: string;
		bar: string;
	}

	const { bar }: Props = $props();
</script>
