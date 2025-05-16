<script>
	import { browser } from '$app/environment';

	for (const x of []) {
		if (browser) {
			console.log(location.href);
			continue;
		}
		console.log(location.href); // NG
	}
	for (const x of []) {
		if (!browser) {
			console.log(location.href); // NG
			continue;
		}
		console.log(location.href);
	}
</script>
