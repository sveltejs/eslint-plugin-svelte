<script lang="ts">
	type WithId = {
		id: string;
	};

	type WithTimestamp = {
		createdAt: Date;
		updatedAt: Date;
	};

	type Props = WithId &
		WithTimestamp & {
			name: string;
		};

	const props: Props = $props();
	console.log(props.id, props.name, props.createdAt.getTime(), props.updatedAt.getTime());
</script>
