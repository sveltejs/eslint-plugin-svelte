<script>
  const variable = new URL("https://svelte.dev/");

	variable.hash = "anchor";
	variable.host = "example.test";
	variable.hostname = "example.test";
	variable.href = "https://svelte.dev/";
	variable.password = "passwd";
	variable.pathname = "tutorial";
	variable.port = "80";
	variable.protocol = "https";
	variable.search = "foo=bar";
	variable.username = "usr";
</script>

{variable}
