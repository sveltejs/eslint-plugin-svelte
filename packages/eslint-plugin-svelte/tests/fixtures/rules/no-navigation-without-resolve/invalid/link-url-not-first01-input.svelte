<script>
	const next = new URL('https://idp.example/cb');
</script>

<a href={`/login?redirect=${next}`}>One</a>
<a href={'/login?redirect=' + next.href}>Two</a>
<a href={'/login?redirect=' + String(next)}>Three</a>
<a href={`/login?redirect=${next.toString()}&x=1`}>Four</a>
