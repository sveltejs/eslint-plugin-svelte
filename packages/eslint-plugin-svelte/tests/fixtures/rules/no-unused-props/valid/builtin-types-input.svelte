<script lang="ts">
	type Props = {
		date: Date;
		regexp: RegExp;
		promise: Promise<string>;
		map: Map<string, number>;
		set: Set<string>;
	};

	const props: Props = $props();
	console.log(
		props.date.getTime(),
		props.regexp.test('test'),
		props.promise.then(console.log),
		props.map.get('key'),
		props.set.has('value')
	);
</script>
