<script lang="ts">
	let out = $state<unknown>();

	function typeAssertion() {
		const set = new Set<string>();
		set.add('a');
		return <Set<string>>set;
	}

	function classField() {
		const set = new Set();
		set.add(1);
		class Store {
			items = set;
		}
		return new Store();
	}

	function defaultValue(obj: { a?: unknown }) {
		const set = new Set();
		set.add(1);
		({ a: out = set } = obj);
	}

	function thrown() {
		const set = new Set();
		set.add(1);
		throw set;
	}

	function logicalAssignment(other: Set<number> | null) {
		let set: Set<number> | null = new Set<number>();
		set.add(1);
		out = (set ||= other);
	}

	function tagged(tag: (s: TemplateStringsArray, v: unknown) => void) {
		const set = new Set();
		set.add(1);
		tag`${set}`;
	}

	function forEachThird() {
		const map = new Map();
		map.set('a', 1);
		map.forEach((value, key, self) => {
			out = self;
		});
	}
</script>

{typeAssertion().size}
{classField()}
