<script>
	import { BROWSER } from 'esm-env';

	if (BROWSER) {
		const a = window.localStorage.getItem('myCat');
		console.log(a);
	}
</script>
