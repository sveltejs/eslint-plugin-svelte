<script>
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';

	const condition = true;

	goto(condition ? resolve('/foo') : '/bar');
	goto(condition ? '/foo' : resolve('/bar'));
	goto(condition ? '/foo' : '/bar');
	const url = condition ? resolve('/foo') : '/bar';
	goto(url);
	const plain = '/bar';
	goto(condition ? resolve('/foo') : plain);
</script>
