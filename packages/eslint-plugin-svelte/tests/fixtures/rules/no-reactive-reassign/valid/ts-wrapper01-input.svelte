<script lang="ts">
	let a = 0;
	$: v = a;
	$: obj = { a, list: [a] };
	function f() {
		const x = v as any;
		const y = obj!.a;
		const z = (obj as any).list.slice();
		let w;
		w = v!;
		w = <any>obj;
		return [x, y, z, w, v satisfies number];
	}
</script>

<button on:click={f}>{v}{obj.a}</button>
