<script>
	let { rel, r } = $props();
</script>

<a href="/other" {rel}>A</a>
<a href="/other" rel={r}>B</a>
<a href="/other" rel="noopener {r}">C</a>
