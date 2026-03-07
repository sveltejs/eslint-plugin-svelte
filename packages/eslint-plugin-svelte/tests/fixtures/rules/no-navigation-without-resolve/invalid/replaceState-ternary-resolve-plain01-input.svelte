<script>
	import { resolve } from '$app/paths';
	import { replaceState } from '$app/navigation';

	const condition = true;

	replaceState(condition ? resolve('/foo') : '/bar');
	replaceState(condition ? '/foo' : resolve('/bar'));
	replaceState(condition ? '/foo' : '/bar');
	const url = condition ? resolve('/foo') : '/bar';
	replaceState(url);
	const plain = '/bar';
	replaceState(condition ? resolve('/foo') : plain);
</script>
