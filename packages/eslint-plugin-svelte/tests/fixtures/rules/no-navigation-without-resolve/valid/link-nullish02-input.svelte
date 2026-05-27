<script lang="ts">
	interface Props {
		one: undefined;
		two: null;
		href: null;
	}

	const { one, two, href }: Props = $props();
</script>

<a href={one}>Click me!</a>
<a href={two}>Click me!</a>
<a {href}>Click me!</a>
