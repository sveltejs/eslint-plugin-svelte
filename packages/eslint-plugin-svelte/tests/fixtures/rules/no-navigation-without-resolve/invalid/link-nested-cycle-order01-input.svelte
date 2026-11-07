<script>
	import { resolve } from '$app/paths';

	let href = $state(resolve('/'));
	let saved = $state(null);
	function save() {
		saved = href;
	}
	function restore() {
		href = saved;
	}
	function ensure() {
		href = href || '/home';
	}
</script>

<!-- Both are reported whichever is checked first. -->
<a href={saved}>Saved</a>
<a href={href}>Home</a>
