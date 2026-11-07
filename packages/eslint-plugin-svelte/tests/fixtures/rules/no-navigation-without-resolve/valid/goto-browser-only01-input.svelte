<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	// goto() only runs in the browser, where resolve() returns an absolute path.
	goto(location.origin + resolve('/foo'));
	goto(new URL(resolve('/foo'), location.href));
	goto(new URL(resolve('/foo'), page.url).href);
	goto(page.url);
	goto(page.url.toString());
</script>
