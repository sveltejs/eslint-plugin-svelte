<a class="link">Click me!</a>

<a class="link">Click me two!</a>

<a>Click me three!</a>

<b class="bold">Text 1</b>

<b class="bold">Text 2</b>

<b data-key="val">Text 3</b>

<b class:conditional={true}>Text 4</b>

<b class="conditional-two">Text 5</b>

<b class:conditional-two={true}>Text 6</b>

<style>
  .link {
    color: red;
  }

  .bold {
    color: red;
  }

  .link:active {
    color: red;
  }

  .link + .bold {
    color: red;
  }

  .bold[data-key="val"] {
    color: red;
  }

  .bold::before {
    color: red;
  }

  .conditional {
    color: red;
  }

  .conditional-two {
    color: red;
  }
</style>
