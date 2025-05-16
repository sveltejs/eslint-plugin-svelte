<script>
	import { browser } from '$app/environment';
	import { BROWSER } from 'esm-env';

	console.log(browser && location.href);
	console.log(BROWSER && location.href);
</script>
