<script>
	import { goto } from '$app/navigation';

	goto('foo');
	goto('./foo');
	goto('../foo');
</script>
