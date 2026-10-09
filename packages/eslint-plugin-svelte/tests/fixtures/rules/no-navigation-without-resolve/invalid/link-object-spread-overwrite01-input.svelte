<script>
	import { resolve } from '$app/paths';
</script>

<a href={({ url: resolve('/safe'), ...{ url: '/bad' } }).url}>Link</a>
