<script lang="ts">
	type Props = {
		date: Date;
		regexp: RegExp;
		promise: Promise<string>;
		map: Map<string, number>;
		set: Set<string>;
	};

	const props: Props = $props();
	console.log(props.date.getTime());
</script>
