<script lang="ts">
	var a: number = 3;
	var b = (x) => {
		a++;
		return x + a;
	};
	setTimeout(() => {
		b(a);
	}, 0);
</script>
