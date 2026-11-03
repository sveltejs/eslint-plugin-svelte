<script lang="ts">
	type Props = { items: string[]; label: string };
	const props: Props = $props();
	const {
		items: [first],
		label
	} = props;
</script>

<p>{first} {label}</p>
