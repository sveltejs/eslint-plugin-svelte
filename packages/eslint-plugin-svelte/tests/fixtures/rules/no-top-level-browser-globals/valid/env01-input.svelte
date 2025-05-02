<script>
	import { browser } from '$app/environment';

	if (browser) {
		const a = window.localStorage.getItem('myCat');
		console.log(a);
	}
</script>
