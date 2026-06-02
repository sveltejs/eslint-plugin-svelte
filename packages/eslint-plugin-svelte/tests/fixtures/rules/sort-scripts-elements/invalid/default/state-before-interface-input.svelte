<script lang="ts">
	let count: Foo = $state({ bar: 'dummy' });
	interface Foo {
		bar: string;
	}
</script>
