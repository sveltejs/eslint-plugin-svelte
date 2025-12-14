<script>
	import { replaceState } from '$app/navigation';

	const keyValue = 'bar=baz';
	const value = '?foo=bar';

	replaceState('?');
	replaceState('?foo=bar');
	replaceState('?' + 'foo=bar');
	replaceState('?' + keyValue);
	replaceState(`?${keyValue}`);
	replaceState(value);
</script>
