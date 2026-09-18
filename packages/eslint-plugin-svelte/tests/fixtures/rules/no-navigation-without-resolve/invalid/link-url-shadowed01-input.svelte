<script>
	// A locally-declared `URL` is not the global URL constructor.
	class URL {
		href = '/internal';
	}

	const one = new URL();
</script>

<a href={one.href}>One</a>
<a href={new URL()}>Two</a>
