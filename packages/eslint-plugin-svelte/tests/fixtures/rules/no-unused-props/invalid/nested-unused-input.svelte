<script lang="ts">
	interface Props {
		user: {
			name: string;
			location: string;
		};
	}
	let props: Props = $props();
	console.log(props.user.name);
</script>
