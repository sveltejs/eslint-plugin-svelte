<script>
	const handler = (ev) => {
		console.log(ev);
	};

	function onClick(event) {
		const target = event.currentTarget;

		const deepObj = {
			deep: {
				obj: {
					target
				}
			}
		};

		target.addEventListener('focus', handler);
		deepObj.deep.obj.target.addEventListener('focus', handler);
	}

	addEventListener('message', handler);
	window.addEventListener('message', handler);
	document.addEventListener('visibilitychange', handler);

	// with a load of whitespace
	window.addEventListener    ('message', handler);
	// with a comment
	window.addEventListener/* foo */('message', handler);
</script>

<button onclick={onClick}>Hello</button>
