<script>
	let count = 0;
	let name = 'World';
	let items = ['a', 'b', 'c'];
	function add() {
		items.push('d');
	}
	function remove() {
		items.pop();
	}
</script>

<h1>{name}</h1>

<style>
	h1 {
		color: red;
		font-size: 2rem;
		font-weight: bold;
		margin: 0;
		padding: 1rem;
		text-align: center;
		border: 1px solid #ccc;
		border-radius: 8px;
		background: white;
	}
</style>
