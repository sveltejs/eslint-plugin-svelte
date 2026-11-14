<script>
	import { goto } from '$app/navigation';

	goto('foo');
	goto('./foo');
</script>

<a href="foo">Click me!</a>
<a href="./foo">Click me!</a>
<a href="../foo">Click me!</a>
