<script>
	import { CustomReactiveClass1, CustomReactiveClass2 } from 'foo';

	// These should be reported as unnecessary $state wrapping
	const custom1 = $state(new CustomReactiveClass1());
	const custom2 = $state(new CustomReactiveClass2());

	// Regular state usage is still valid
	const regularState = $state(42);
</script>
