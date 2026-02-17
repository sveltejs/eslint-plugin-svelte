<script>
	import { resolve } from '$app/paths';

	const resolved = resolve('/foo/');
	const keyValue = 'bar=baz';
	const queryValue = 'something?';
	const section = 'section';
	const fragment = 'section#';
	const href = resolved + 'foo=bar?';

	const query1 = resolve('/foo') + 'something';
	const query2 = resolve('/foo') + 'something?';
	const query3 = resolve('/foo') + 'something' + '?';
	const query4 = resolve('/foo') + keyValue + '?';
	const query5 = resolve('/foo') + `${keyValue}?`;
	const query6 = resolve('/foo') + queryValue;
	const fragment1 = resolve('/foo') + 'something';
	const fragment2 = resolve('/foo') + 'something#';
	const fragment3 = resolve('/foo') + 'something' + '#';
	const fragment4 = resolve('/foo') + section + '#';
	const fragment5 = resolve('/foo') + `${keyValue}#`;
	const fragment6 = resolve('/foo') + fragment;
</script>

<a href={resolve('/foo') + 'something'}>Click me!</a>
<a href={resolve('/foo') + 'something?'}>Click me!</a>
<a href={resolve('/foo') + 'something' + '?'}>Click me!</a>
<a href={resolve('/foo') + keyValue + '?'}>Click me!</a>
<a href={resolve('/foo') + `${keyValue}?`}>Click me!</a>
<a href={resolve('/foo') + queryValue}>Click me!</a>
<a href={`${resolve('/foo')}something`}>Click me!</a>
<a href={`${resolve('/foo')}something?`}>Click me!</a>
<a href={`${resolve('/foo')}${'something' + '?'}`}>Click me!</a>
<a href={`${resolve('/foo')}${keyValue}?`}>Click me!</a>
<a href={`${resolve('/foo')}${keyValue}?`}>Click me!</a>
<a href={`${resolve('/foo')}${queryValue}`}>Click me!</a>
<a href={resolved + 'something'}>Click me!</a>
<a href={resolved + 'something?'}>Click me!</a>
<a href={resolved + 'something' + '?'}>Click me!</a>
<a href={resolved + keyValue + '?'}>Click me!</a>
<a href={resolved + `${keyValue}?`}>Click me!</a>
<a href={resolved + queryValue}>Click me!</a>
<a href={`${resolved}something`}>Click me!</a>
<a href={`${resolved}something?`}>Click me!</a>
<a href={`${resolved}${'something' + '?'}`}>Click me!</a>
<a href={`${resolved}${keyValue}?`}>Click me!</a>
<a href={`${resolved}${keyValue}?`}>Click me!</a>
<a href={`${resolved}${queryValue}`}>Click me!</a>
<a href={query1}>Click me!</a>
<a href={query2}>Click me!</a>
<a href={query3}>Click me!</a>
<a href={query4}>Click me!</a>
<a href={query5}>Click me!</a>
<a href={query6}>Click me!</a>
<a href={resolve('/foo') + 'something'}>Click me!</a>
<a href={resolve('/foo') + 'something#'}>Click me!</a>
<a href={resolve('/foo') + 'something' + '#'}>Click me!</a>
<a href={resolve('/foo') + section + '#'}>Click me!</a>
<a href={resolve('/foo') + `${section}#`}>Click me!</a>
<a href={resolve('/foo') + fragment}>Click me!</a>
<a href={`${resolve('/foo')}something`}>Click me!</a>
<a href={`${resolve('/foo')}something#`}>Click me!</a>
<a href={`${resolve('/foo')}${'something' + '#'}`}>Click me!</a>
<a href={`${resolve('/foo')}${section}#`}>Click me!</a>
<a href={`${resolve('/foo')}${section}#`}>Click me!</a>
<a href={`${resolve('/foo')}${fragment}`}>Click me!</a>
<a href={resolved + 'something'}>Click me!</a>
<a href={resolved + 'something#'}>Click me!</a>
<a href={resolved + 'something' + '#'}>Click me!</a>
<a href={resolved + section + '#'}>Click me!</a>
<a href={resolved + `${section}#`}>Click me!</a>
<a href={resolved + fragment}>Click me!</a>
<a href={`${resolved}something`}>Click me!</a>
<a href={`${resolved}something#`}>Click me!</a>
<a href={`${resolved}${'something' + '#'}`}>Click me!</a>
<a href={`${resolved}${section}#`}>Click me!</a>
<a href={`${resolved}${section}#`}>Click me!</a>
<a href={`${resolved}${fragment}`}>Click me!</a>
<a href={fragment1}>Click me!</a>
<a href={fragment2}>Click me!</a>
<a href={fragment3}>Click me!</a>
<a href={fragment4}>Click me!</a>
<a href={fragment5}>Click me!</a>
<a href={fragment6}>Click me!</a>
<a {href}>Click me!</a>
