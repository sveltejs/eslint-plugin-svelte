<script>
	import { goto, pushState, replaceState, preloadData, preloadCode } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	const slug = 'hello';

	goto('/foo');
	goto(`/blog/${slug}`);
	goto('/foo', { replaceState: true });
	pushState('/foo', {});
	replaceState('/foo', {});
	preloadData('/foo');
	preloadCode('/foo', '/bar');
	goto(new URL('/foo', page.url));
	goto(resolve('/foo') + '/bar');
	goto('/foo' + resolve('/bar'));
</script>
