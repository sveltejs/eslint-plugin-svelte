<script>
	import { browser } from '$app/environment';
	console.log(browser ? location.href : null);
	console.log(!browser ? null : location.href);
</script>
