<script lang="ts">
	type Props = { 0: { a: string; b: string }; z: string };
	const props: Props = $props();
</script>

<p>{props[0].a}</p>
