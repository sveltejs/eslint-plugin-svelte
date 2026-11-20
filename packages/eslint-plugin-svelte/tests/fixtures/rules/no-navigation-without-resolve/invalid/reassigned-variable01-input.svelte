<script>
	import { goto, pushState } from '$app/navigation';
	import { resolve } from '$app/paths';

	let opts = { shallow: true };
	opts = {};
	goto('', opts);

	let config = { opts: { shallow: true } };
	config = { opts: {} };
	goto('', config.opts);

	let url = resolve('/');
	url = '/foo';
	goto(url);
	pushState(url, {});

	let paths = [resolve('/')];
	paths = ['/foo'];
</script>

<a href={url}>Link</a>
<a href={paths[0]}>Link</a>
