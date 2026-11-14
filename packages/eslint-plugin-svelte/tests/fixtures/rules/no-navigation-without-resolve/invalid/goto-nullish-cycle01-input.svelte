<script>
	import { goto } from '$app/navigation';

	let a = $state(null);
	let b = $state(null);
	function f() {
		a = b ?? '/x';
		b = a;
	}
	// Reported whichever is checked first.
	goto(b);
	goto(a);
</script>
