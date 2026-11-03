<script lang="ts">
	let { items, base, date } = $props();

	function summary() {
		const set = new Set<string>() as Set<string>;
		for (const item of items) set.add(item);
		const copy = [...set];
		const array = Array.from(set);
		const cloned = new Set(set);
		cloned.add('x');
		const json = JSON.stringify(set, null, 2) + JSON.stringify(array, ['a']);
		const mapped = Array.from(set, (value) => value.length);
		const text = `${set.size} ${String(set)}`;
		if (set.has('a') && set.size > 0) {
			set.delete('a');
		}
		set.forEach((value) => console.log(value));
		return { copy, array, mapped, size: cloned.size, json, text };
	}

	function nextUrl() {
		const url = new URL(base);
		url.pathname = '/next';
		url.searchParams.get('q');
		return url.href;
	}

	function startOfDay() {
		return new Date(date).setHours(0, 0, 0, 0);
	}

	function query() {
		const params = new URLSearchParams();
		params.set('a', '1');
		params.append('b', '2');
		return params.toString();
	}
</script>

{summary().json}
{nextUrl()}
{startOfDay()}
{query()}
