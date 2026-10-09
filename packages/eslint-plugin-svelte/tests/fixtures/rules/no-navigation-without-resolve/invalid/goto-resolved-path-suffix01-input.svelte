<script>
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';

	const resolved = resolve('/foo');
	const empty = '';
	const path = '/bar';

	goto(resolve('/foo') + '/bar');
	goto(resolve('/foo') + '' + '/../admin');
	goto(resolved + empty + 'bar');
	goto(resolved + path);
	goto(`${resolve('/foo')}` + '/evil');
	goto(`${resolve('/foo')}${''}/evil`);
	goto(`${resolved}${empty}/bar`);
	goto(`${resolved}${path}?query=param`);
</script>
