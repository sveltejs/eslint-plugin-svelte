<script lang="ts">
	let a = 0;
	$: v = a;
	$: obj = { a, list: [a] };
	function f() {
		v = 1;
		(v as any) = 2;
		obj!.a = 3;
		(v satisfies number) = 4;
		(<any>v) = 5;
		v! += 6;
		(v as any)++;
		(obj as any).list.push(7);
		delete (obj as any).a;
		[v as any] = [8];
		({ a: v! } = { a: 9 });
		for (v! of [10]);
		obj!!.a = 11;
		(obj as { a: number } as any).a = 12;
	}
</script>

<button on:click={f}>{v}{obj.a}</button>
