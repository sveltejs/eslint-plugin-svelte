<script>
	let a = true;
	let a7 = 7;
	let danger = false;
</script>

<button class={a ? 'a' : 'b'}>foo</button>
<button class={!a ? 'b' : 'a'}>foo</button>
<button class={a7 === 7 ? 'a' : 'b'}>foo</button>
<button class="btn {danger ? 'btn-danger' : 'btn-primary'}">foo</button>
