<script>
	import { resolve } from '$app/paths';
</script>

<form method="POST" action="?/login"></form>
<form method="POST" action=""></form>
<form method="POST"></form>
<form method="POST" action="{resolve('/login')}?/signin"></form>
<form>
	<button formaction="?/register">Register</button>
	<input type="submit" formaction="?/login" />
</form>
