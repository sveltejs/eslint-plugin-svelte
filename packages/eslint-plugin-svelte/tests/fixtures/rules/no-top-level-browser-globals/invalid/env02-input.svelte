<script>
	import { BROWSER } from 'esm-env';
	import * as env from 'esm-env';

	if (BROWSER) {
		console.log(location.href);
	} else {
		console.log(location.href); // NG
	}
	if (env.BROWSER) {
		console.log(location.href);
	} else {
		console.log(location.href); // NG
	}
</script>
