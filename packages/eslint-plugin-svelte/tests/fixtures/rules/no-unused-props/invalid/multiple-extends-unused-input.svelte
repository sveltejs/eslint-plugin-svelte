<script lang="ts">
	interface BaseProps {
		id: string;
		type: 'user' | 'admin';
	}

	interface UserProps extends BaseProps {
		name: string;
		email: string;
	}

	interface Props extends UserProps {
		role: string;
		permissions: string[];
	}

	let props: Props = $props();
	console.log(props.id, props.type, props.name, props.role);
</script>
