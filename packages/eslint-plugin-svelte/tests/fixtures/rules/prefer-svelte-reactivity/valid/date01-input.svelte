<script>
  const variable = new Date(8.64e15);

	console.log(Date.now());
	console.log(Date.parse("1970-01-01T00:00:00Z"));
	console.log(Date.UTC(96, 1, 2, 3, 4, 5));
	console.log(variable.getDate());
	console.log(variable.getDay());
	console.log(variable.getFullYear());
	console.log(variable.getHours());
	console.log(variable.getMilliseconds());
	console.log(variable.getMinutes());
	console.log(variable.getMonth());
	console.log(variable.getSeconds());
	console.log(variable.getTime());
	console.log(variable.getTimezoneOffset());
	console.log(variable.getUTCDate());
	console.log(variable.getUTCDay());
	console.log(variable.getUTCFullYear());
	console.log(variable.getUTCHours());
	console.log(variable.getUTCMilliseconds());
	console.log(variable.getUTCMinutes());
	console.log(variable.getUTCMonth());
	console.log(variable.getUTCSeconds());
	console.log(variable.getYear());
	console.log(variable.toDateString());
	console.log(variable.toISOString());
	console.log(variable.toJSON());
	console.log(variable.toLocaleDateString());
	console.log(variable.toLocaleString());
	console.log(variable.toLocaleTimeString());
	console.log(variable.toString());
	console.log(variable.toTemporalInstant());
	console.log(variable.toTimeString());
	console.log(variable.toUTCString());
	console.log(variable.valueOf());
	console.log(variable[Symbol.toPrimitive]("string"));
</script>

{variable}
