<script>
  const variable = new URLSearchParams("foo=1&bar=2");

  variable.delete("bar", "42");
</script>

{variable}
