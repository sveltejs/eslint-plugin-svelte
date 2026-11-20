<script>
	const mail = new URL('mailto:a@example.com');
	const data = new URL('data:text/plain,hello');
	const web = new URL('https://svelte.dev/blog');
</script>

<a href={mail.origin}>Mail</a>
<a href={data.origin}>Data</a>
<a href={web.origin}>Web</a>
<a href={new URL('mailto:a@example.com').origin}>Inline</a>
