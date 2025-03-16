<a class="link">Click me!</a>

<a class="link">Click me two!</a>

<b class="bold">Text 1</b>

<b class="bold">Text 2</b>

<b data-key="val">Text 2</b>

<b class:conditional={true}>Text 3</b>

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
</style>
