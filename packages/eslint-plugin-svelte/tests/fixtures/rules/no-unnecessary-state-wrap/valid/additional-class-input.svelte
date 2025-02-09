<script>
	import { CustomReactiveClass1, CustomReactiveClass2 } from 'foo';
	// These should be allowed when not wrapped with $state
	const custom1 = new CustomReactiveClass1();
	const custom2 = new CustomReactiveClass2();

	// Regular state usage is still valid
	const regularState = $state(42);
</script>
