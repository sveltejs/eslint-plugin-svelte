<script>
	const variable = new Set([1, 2, 1, 3, 3]);
	const other = new Set([1, 2]);

	console.log(Set[Symbol.species]);
	console.log(variable.difference(other));
	console.log(variable.entries());
	variable.forEach((value) => {
		console.log(value);
	});
	console.log(variable.has(1));
	console.log(variable.intersection(other));
	console.log(variable.isDisjointFrom(other));
	console.log(variable.isSubsetOf(other));
	console.log(variable.isSupersetOf(other));
	console.log(variable.keys());
	console.log(variable.symmetricDifference(other));
	console.log(variable.union(other));
	console.log(variable.values());
	console.log(variable[Symbol.iterator]());
	console.log(variable.size);
</script>

{variable}
