<script>
	const variable = new URLSearchParams("foo=1&bar=2");

	console.log(variable.size);
	console.log(variable.entries());
	variable.forEach((value, key) => {
		console.log(key);
		console.log(value);
	})
	console.log(variable.get("foo"));
	console.log(variable.getAll("foo"));
	console.log(variable.has("foo"));
	console.log(variable.has("foo", "1"));
	console.log(variable.keys());
	console.log(variable.toString());
	console.log(variable.values());
</script>

{variable}
