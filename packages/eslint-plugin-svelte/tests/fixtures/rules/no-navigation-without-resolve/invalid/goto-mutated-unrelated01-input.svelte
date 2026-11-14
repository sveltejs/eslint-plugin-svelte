<script>
	import { goto } from '$app/navigation';

	const link = { href: '/a', count: 0 };
	// Reading a property is not a write.
	console.log(link.count);
	goto(link.href);
	const z = link.href.toUpperCase();
</script>
