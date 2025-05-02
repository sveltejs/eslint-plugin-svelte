<script>
	import { browser } from '$app/environment';
	import * as env from '$app/environment';

	if (browser) {
		console.log(location.href);
	} else {
		console.log(location.href); // NG
	}
	if (env.browser) {
		console.log(location.href);
	} else {
		console.log(location.href); // NG
	}
</script>
