<script>
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';

	const preResolved = resolve('/');
	const searchParams = new URLSearchParams();
	const query = searchParams.size ? '?' + searchParams : '';

	goto('?query=param');
	goto('?' + searchParams);
	goto(`?${searchParams}`);

	goto(preResolved);
	goto(preResolved + '?query=param');
	goto(preResolved + '?' + searchParams);
	goto(preResolved + `?${searchParams}`);
	goto(preResolved + query);

	goto(`${preResolved}`);
	goto(`${preResolved}?query=param`);
	goto(`${preResolved}?${searchParams}`);
	goto(`${preResolved + query}`);
	goto(`${preResolved}${query}`);

	goto(resolve('/') + '?query=param');
	goto(resolve('/') + '?' + searchParams);
	goto(resolve('/') + `?${searchParams}`);
	goto(resolve('/') + query);

	goto(`${resolve('/')}?query=param`);
	goto(`${resolve('/')}?${searchParams}`);
	goto(`${resolve('/') + query}`);
	goto(`${resolve('/')}${query}`);

	goto((searchParams.size ? resolve('/foo') : resolve('/bar')) + query);
</script>
