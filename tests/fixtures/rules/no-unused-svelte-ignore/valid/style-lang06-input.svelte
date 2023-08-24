<div class="foo">
	<div class="bar" />
</div>

<!-- svelte-ignore css-unused-selector -->
<style lang="stylus">
  .foo
    height: 20px
    width: 20px
    .foo
      height: 10px
      width: 10px
</style>
