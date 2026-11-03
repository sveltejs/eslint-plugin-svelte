<script lang="ts">
	type Props = { a: { a: { b: number } }; c: number };
	const props: Props = $props();
	var { a } = props;
	var { a } = a;
</script>

<p>{a.b}</p>
