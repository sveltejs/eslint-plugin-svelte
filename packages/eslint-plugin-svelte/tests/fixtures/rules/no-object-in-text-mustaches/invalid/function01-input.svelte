<script>
	let a = 'hello!';
</script>

{() => a}
{function () {
	return a;
}}
<input class="{() => a} a" />
