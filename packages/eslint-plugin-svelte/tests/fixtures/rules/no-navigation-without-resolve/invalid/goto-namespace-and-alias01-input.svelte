<script>
	import * as navigation from '$app/navigation';
	import { goto as navigate } from '$app/navigation';
	import * as paths from '$app/paths';

	navigation.goto('/foo');
	navigate('/foo');
	navigation.pushState('/foo', {});
</script>
