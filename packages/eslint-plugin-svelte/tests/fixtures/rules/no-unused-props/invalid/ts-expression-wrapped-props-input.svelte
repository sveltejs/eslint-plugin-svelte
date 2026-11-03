<script lang="ts">
	type Props = { a: string; b: string; c: string; d: string };
	const props: Props = $props();
	const { d } = props as Props;
</script>

<p>{props!.a} {(props satisfies Props).c} {d}</p>
