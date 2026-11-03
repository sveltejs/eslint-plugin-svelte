<script>
	const variable = new Map([[1, "one"], [2, "two"]]);

	console.log(Map.groupBy(variable, (element) => "group"));
	console.log(Map[Symbol.species]);
	console.log(variable.entries());
	variable.forEach((value) => {
		console.log(value);
	});
	console.log(variable.get(1));
	console.log(variable.has(1));
	console.log(variable.keys());
	console.log(variable.values());
	console.log(variable[Symbol.iterator]());
	console.log(variable.size);
</script>

{variable}
