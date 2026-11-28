<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let opts = { shallow: true };
	goto('', opts);

	let config = { opts: { shallow: true } };
	goto('', config.opts);

	let url = resolve('/');
	goto(url);

	let paths = [resolve('/')];
</script>

<a href={url}>Link</a>
<a href={paths[0]}>Link</a>
