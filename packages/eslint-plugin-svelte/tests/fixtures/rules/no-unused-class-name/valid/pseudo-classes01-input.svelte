<div class="div-class">Hello</div>

<span class="span-class-one">World</span>

<span class="span-class-two">!</span>

<style>
	:not(.div-class) {
		color: red;
	}
	:is(.span-class-one, .span-class-two) {
		color: red;
	}
</style>
