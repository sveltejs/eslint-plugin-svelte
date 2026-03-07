<script>
	import { resolve } from '$app/paths';
	import { pushState } from '$app/navigation';

	const condition = true;

	pushState(condition ? resolve('/foo') : '/bar');
	pushState(condition ? '/foo' : resolve('/bar'));
	pushState(condition ? '/foo' : '/bar');
	const url = condition ? resolve('/foo') : '/bar';
	pushState(url);
	const plain = '/bar';
	pushState(condition ? resolve('/foo') : plain);
</script>
