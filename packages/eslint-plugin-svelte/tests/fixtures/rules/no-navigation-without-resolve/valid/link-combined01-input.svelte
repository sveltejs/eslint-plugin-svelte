<script>
	import { resolve } from '$app/paths';

	const resolved = resolve('/foo/');
	const empty = '';
	const keyValue = 'bar=baz';
	const queryValue = '?foo=bar';
	const section = 'section';
	const fragment = '#section';
	const href = resolved + '?foo=bar';

	const query1 = resolve('/foo') + '?';
	const query2 = resolve('/foo') + '?foo=bar';
	const query3 = resolve('/foo') + '?' + 'foo=bar';
	const query4 = resolve('/foo') + '?' + keyValue;
	const query5 = resolve('/foo') + `?${keyValue}`;
	const query6 = resolve('/foo') + queryValue;
	const fragment1 = resolve('/foo') + '#';
	const fragment2 = resolve('/foo') + '#section';
	const fragment3 = resolve('/foo') + '#' + 'section';
	const fragment4 = resolve('/foo') + '#' + section;
	const fragment5 = resolve('/foo') + `#${section}`;
	const fragment6 = resolve('/foo') + fragment;
</script>

<a href={resolve('/foo') + ''}>Click me!</a>
<a href={resolve('/foo') + empty}>Click me!</a>
<a href={resolve('/foo') + '?'}>Click me!</a>
<a href={resolve('/foo') + '?foo=bar'}>Click me!</a>
<a href={resolve('/foo') + '?' + 'foo=bar'}>Click me!</a>
<a href={resolve('/foo') + '?' + keyValue}>Click me!</a>
<a href={resolve('/foo') + `?${keyValue}`}>Click me!</a>
<a href={resolve('/foo') + queryValue}>Click me!</a>
<a href={`${resolve('/foo')}?`}>Click me!</a>
<a href={`${resolve('/foo')}?foo=bar`}>Click me!</a>
<a href={`${resolve('/foo')}${'?' + 'foo=bar'}`}>Click me!</a>
<a href={`${resolve('/foo')}${'?' + keyValue}`}>Click me!</a>
<a href={`${resolve('/foo')}?${keyValue}`}>Click me!</a>
<a href={`${resolve('/foo')}${queryValue}`}>Click me!</a>
<a href={resolved + '?'}>Click me!</a>
<a href={resolved + '?foo=bar'}>Click me!</a>
<a href={resolved + '?' + 'foo=bar'}>Click me!</a>
<a href={resolved + '?' + keyValue}>Click me!</a>
<a href={resolved + `?${keyValue}`}>Click me!</a>
<a href={resolved + queryValue}>Click me!</a>
<a href={`${resolved}?`}>Click me!</a>
<a href={`${resolved}?foo=bar`}>Click me!</a>
<a href={`${resolved}${'?' + 'foo=bar'}`}>Click me!</a>
<a href={`${resolved}${'?' + keyValue}`}>Click me!</a>
<a href={`${resolved}?${keyValue}`}>Click me!</a>
<a href={`${resolved}${queryValue}`}>Click me!</a>
<a href={query1}>Click me!</a>
<a href={query2}>Click me!</a>
<a href={query3}>Click me!</a>
<a href={query4}>Click me!</a>
<a href={query5}>Click me!</a>
<a href={query6}>Click me!</a>
<a href={resolve('/foo') + '#'}>Click me!</a>
<a href={resolve('/foo') + '#section'}>Click me!</a>
<a href={resolve('/foo') + '#' + 'section'}>Click me!</a>
<a href={resolve('/foo') + '#' + section}>Click me!</a>
<a href={resolve('/foo') + `#${section}`}>Click me!</a>
<a href={resolve('/foo') + fragment}>Click me!</a>
<a href={`${resolve('/foo')}#`}>Click me!</a>
<a href={`${resolve('/foo')}#section`}>Click me!</a>
<a href={`${resolve('/foo')}${'#' + 'section'}`}>Click me!</a>
<a href={`${resolve('/foo')}${'#' + section}`}>Click me!</a>
<a href={`${resolve('/foo')}#${section}`}>Click me!</a>
<a href={`${resolve('/foo')}${fragment}`}>Click me!</a>
<a href={resolved + '#'}>Click me!</a>
<a href={resolved + '#section'}>Click me!</a>
<a href={resolved + '#' + 'section'}>Click me!</a>
<a href={resolved + '#' + section}>Click me!</a>
<a href={resolved + `#${section}`}>Click me!</a>
<a href={resolved + fragment}>Click me!</a>
<a href={`${resolved}#`}>Click me!</a>
<a href={`${resolved}#section`}>Click me!</a>
<a href={`${resolved}${'#' + 'section'}`}>Click me!</a>
<a href={`${resolved}${'#' + section}`}>Click me!</a>
<a href={`${resolved}#${section}`}>Click me!</a>
<a href={`${resolved}${fragment}`}>Click me!</a>
<a href={fragment1}>Click me!</a>
<a href={fragment2}>Click me!</a>
<a href={fragment3}>Click me!</a>
<a href={fragment4}>Click me!</a>
<a href={fragment5}>Click me!</a>
<a href={fragment6}>Click me!</a>
<a {href}>Click me!</a>
