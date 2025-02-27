<script lang="ts">
	type WithId = {
		id: string;
		version: number;
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
	console.log(props.id, props.name, props.createdAt);
</script>
