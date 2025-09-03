<script>
	import { goto } from '$app/navigation';

	goto('http://localhost/foo/');
	goto('https://localhost/foo/');
	goto('mailto:user@example.com');
	goto('tel:+123456789');
</script>
