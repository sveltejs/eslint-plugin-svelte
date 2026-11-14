<script>
	import { asset } from '$app/paths';

	let { name } = $props();
</script>

<a href="{asset('/docs')}/{name}.pdf">Docs</a>
<img src={asset('/img') + '.png'} alt="" />
