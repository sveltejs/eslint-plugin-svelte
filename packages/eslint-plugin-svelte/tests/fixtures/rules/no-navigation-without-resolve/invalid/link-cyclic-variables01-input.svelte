<script>
	const a = b;
	const b = a;
	const c = c + 'x';
	const d = e + '' + '';
	const e = d + '' + '';
	const f = cond ? g : '/foo';
	const g = cond ? f : '/foo';
</script>

<a href={a}>1</a>
<a href={c}>2</a>
<a href={d}>3</a>
<a href={f}>4</a>
<a href={a + 'x'}>5</a>
