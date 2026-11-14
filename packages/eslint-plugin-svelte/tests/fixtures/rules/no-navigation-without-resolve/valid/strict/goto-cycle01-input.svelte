<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let a = resolve('/a');
	let b = a;
	a = b;
	goto(a);
</script>
