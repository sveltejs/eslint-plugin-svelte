<script>
	import SOME_IMPORTED_CONSTANT, { other } from './constants.js';
	import * as all from './constants.js';

	const LIMIT = 10;
	const DOUBLE_LIMIT = LIMIT * 2;
	const OPTIONS = [LIMIT, { other }];

	let config = $derived(SOME_IMPORTED_CONSTANT);
	let limit = $derived(DOUBLE_LIMIT);
	let options = $derived(OPTIONS);
	let module = $derived(all);
	let combined = $derived(`${other}-${LIMIT}`);
</script>

{config}{limit}{options}{module}{combined}
