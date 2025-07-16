<script>
  const variable = new URL("https://svelte.dev/");

  variable.search = "foo=bar";
</script>

{variable}
