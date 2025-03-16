<script lang="ts">
	type IsString<T> = T extends string ? true : false;
	type StringOrNumber<T> = T extends string ? string : number;

	interface Props<T> {
		value: T;
		isString: IsString<T>;
		converted: StringOrNumber<T>;
	}

	const props: Props<string> = $props();
	console.log(props.value.length);
	if (props.isString) {
		console.log(props.converted.toUpperCase());
	}
</script>
