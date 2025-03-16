<script lang="ts">
	interface Props {
		user: {
			name: string;
			profile: {
				age: number;
				bio: string;
			};
		};
	}
	let props: Props = $props();
	console.log(props.user.name, props.user.profile.age, props.user.profile.bio);
</script>
