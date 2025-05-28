<script>
  const variable = new Map([[1, "one"], [2, "two"]]);

	variable.clear();
	variable.delete(1);
	variable.set(1, "two");
</script>

{variable}
