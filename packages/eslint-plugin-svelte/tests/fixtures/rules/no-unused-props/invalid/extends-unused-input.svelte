<script lang="ts">
	interface BaseProps {
		id: string;
		type: 'user' | 'admin';
		role: string;
	}

	interface Props extends BaseProps {
		name: string;
		email: string;
	}

	let props: Props = $props();
	console.log(props.id, props.type, props.name);
</script>
