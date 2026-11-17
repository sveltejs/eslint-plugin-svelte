<script>
	import { browser } from '$app/environment';
	import * as env from '$app/environment';
	import * as esmEnv from 'esm-env';

	const { browser: b } = env;
	const isBrowser = browser;
	const alsoBrowser = isBrowser;
	const viaMember = env.browser;
	const { BROWSER } = esmEnv;
	const { SSR } = import.meta.env;
	const ssr = import.meta.env.SSR;

	if (b) console.log(location.href);
	if (isBrowser) console.log(location.href);
	if (alsoBrowser) console.log(location.href);
	if (viaMember) console.log(location.href);
	if (BROWSER) console.log(location.href);
	if (!SSR) console.log(location.href);
	if (!ssr) console.log(location.href);
</script>
