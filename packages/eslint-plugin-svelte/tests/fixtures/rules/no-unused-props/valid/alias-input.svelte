<script lang="ts">
	type Props = {
		test: string;
		'aria-label'?: string;
	};

	const { test, 'aria-label': ariaLabel }: Props = $props();
</script>

<h1>{test}</h1>
<div aria-label={ariaLabel}>svelte/no-unused-props does not always respect aliases</div>
