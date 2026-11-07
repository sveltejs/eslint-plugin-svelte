<script>
	import { goto } from '$app/navigation';

	let x = '';
	function f() {
		x = x && '/b';
	}
	goto(x);
	let next = $state(null);
</script>

<a href={next && '/login'}>Login</a>
