<script>
	import { browser } from '$app/environment';
	import { BROWSER } from 'esm-env';

	const isBrowser = browser;
	const { BROWSER: isEsmBrowser } = { BROWSER };
	const ssr = import.meta.env.SSR;

	if (!isBrowser) console.log(location.href);
	if (ssr) console.log(location.href);
	console.log(isBrowser, isEsmBrowser, document.title);
</script>
