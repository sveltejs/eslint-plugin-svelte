<script>
	let div;
	const update = () => {
		div.textContent = ''; // https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
		div.innerHTML = ''; // https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
		div.outerHTML = ''; // https://developer.mozilla.org/en-US/docs/Web/API/Element/outerHTML
		div.innerText = ''; // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText
		div.outerText = ''; // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/outerText
	};
</script>

<div bind:this={div}>div</div>

<button on:click={() => update()}>Click Me</button>
