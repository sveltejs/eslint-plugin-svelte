<script>
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';

	const a = b;
	const b = a;
	const c = c + '?';
	const d = e + '' + '';
	const e = d + '' + '';
	const f = cond ? g : resolve('/foo');
	const g = cond ? f : resolve('/foo');
	const h = `${h}?`;

	goto(a);
	goto(c);
	goto(d);
	goto(f);
	goto(h);
	goto(a + '?');
	goto(d + '#');
</script>
