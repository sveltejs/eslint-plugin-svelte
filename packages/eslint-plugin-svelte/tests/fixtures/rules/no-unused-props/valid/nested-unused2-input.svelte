<script lang="ts">
	interface Props {
		user: {
			name: string;
			age: number; // Won't be reported as unused
		};
	}
	let { user }: Props = $props();
	console.log(user.name);
</script>
