<script>
	import { browser } from '$app/environment';
	console.log(browser ? null : location.href); // NG
	console.log(!browser ? location.href : null); // NG
</script>
