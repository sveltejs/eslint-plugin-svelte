<script>
	let { page, pageNum } = $props();

	function getNextPage() {
		const newUrl = new URL(page.url);
		newUrl.pathname = page.url.pathname;
		newUrl.searchParams.set('p', (pageNum + 1).toString());
		return newUrl.toString();
	}

	function abc() {
		let x = new Set([1, 2, 3]);
		x.add(4);
		return x.size;
	}
</script>

<a href={getNextPage()}>next {abc()}</a>
