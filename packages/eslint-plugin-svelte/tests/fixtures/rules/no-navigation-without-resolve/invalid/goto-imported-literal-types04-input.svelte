<script lang="ts">
	import { goto } from '$app/navigation';
	import wrappedDefault, { src, wrapped, wrap } from './_links';

	// The same property symbol as `src.a`, but from a function result: not trusted.
	goto(wrapped.a);
	goto(wrappedDefault.a);
	const { a } = wrapped;
	goto(a);
	const local = $derived(wrap(src));
	goto(local.a);
	const nested = { l: wrap(src) };
	goto(nested.l.a);
	// Written out: trusted.
	goto(src.a);
</script>
