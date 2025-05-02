<script>
	import { browser } from '$app/environment';

	for (const x of []) {
		if (browser) {
			console.log(location.href);
			if (x) {
				continue;
			} else {
				break;
			}
		}
		// console.log(location.href); // NG
	}
	for (const x of []) {
		if (!browser) {
			// console.log(location.href); // NG
			if (x) {
				continue;
			} else {
				break;
			}
		}
		console.log(location.href);
	}
</script>
