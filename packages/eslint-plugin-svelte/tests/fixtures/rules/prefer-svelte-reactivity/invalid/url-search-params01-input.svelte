<script>
  const variable = new URLSearchParams("foo=1&bar=2");

	variable.append("baz", "3");
	variable.delete("foo");
	variable.delete("bar", "42");
	variable.set("foo", "-1")
	variable.sort();
</script>

{variable}
