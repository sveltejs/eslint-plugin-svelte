<script lang="ts">
	interface BaseProps {
		id: string;
		type: 'user' | 'admin';
	}

	interface Props extends BaseProps {
		name: string;
	}

	let { name, type }: Props = $props();
	console.log(name, type);
</script>
