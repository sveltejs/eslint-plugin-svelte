export function createUser(data) {
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	return {
		get user() {
			return user;
		}
	};
}
