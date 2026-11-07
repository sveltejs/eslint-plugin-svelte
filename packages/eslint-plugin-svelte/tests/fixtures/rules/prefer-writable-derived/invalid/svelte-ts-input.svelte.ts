export function createUser(data: { user: { name: string } }) {
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	return {
		get name() {
			return `${user.name}`;
		}
	};
}
