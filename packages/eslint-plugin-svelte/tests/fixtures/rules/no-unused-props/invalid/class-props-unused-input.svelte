<script lang="ts">
	class User {
		constructor(
			public name: string,
			public age: number
		) {}
	}

	type Props = {
		user: User;
		data: {
			value: string;
		};
	};

	const props: Props = $props();
	console.log(props.user.name);
</script>
