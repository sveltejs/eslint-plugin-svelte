<script lang="ts">
	interface BaseProps {
		id: string;
		type: 'user' | 'admin';
	}

	interface Props extends BaseProps {
		name: string;
		permissions: string[];
	}

	let props: Props = $props();
	console.log(props.id, props.type, props.name, props.permissions);
</script>
