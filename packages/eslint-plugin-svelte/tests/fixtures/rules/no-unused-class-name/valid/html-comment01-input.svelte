<div class="a">a</div>
<div class="b">b</div>
<div class="c">c</div>
<div class="d">d</div>

<style>
	<!-- a comment -->
	.a {
		color: red;
	}

	<!-- a comment with
	two lines --> .b > .b {
		color: red;
	}

	@media (min-width: 100px) {
		<!-- a comment --> .c,
		<!-- a comment --> .d {
			color: red;
		}
	}
</style>
