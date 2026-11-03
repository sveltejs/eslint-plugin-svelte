<script lang="ts">
	interface Props {
		href: string;
	}

	const { href }: Props = $props();
</script>

<a {href}>Click me!</a>
