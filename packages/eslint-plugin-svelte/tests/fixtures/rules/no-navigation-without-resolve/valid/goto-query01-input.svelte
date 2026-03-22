<script>
	import { goto } from '$app/navigation';

	const keyValue = 'bar=baz';
	const value = '?foo=bar';

	goto('?');
	goto('?foo=bar');
	goto('?' + 'foo=bar');
	goto('?' + keyValue);
	goto(`?${keyValue}`);
	goto(value);
</script>
