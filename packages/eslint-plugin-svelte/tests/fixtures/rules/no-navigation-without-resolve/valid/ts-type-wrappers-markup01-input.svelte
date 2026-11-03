<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<a href={resolve('/') as string}>Link</a>
<a href={resolve('/')!}>Link</a>
