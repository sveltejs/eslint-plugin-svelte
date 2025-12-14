<script>
	import { pushState } from '$app/navigation';

	const keyValue = 'bar=baz';
	const value = '?foo=bar';

	pushState('?');
	pushState('?foo=bar');
	pushState('?' + 'foo=bar');
	pushState('?' + keyValue);
	pushState(`?${keyValue}`);
	pushState(value);
</script>
