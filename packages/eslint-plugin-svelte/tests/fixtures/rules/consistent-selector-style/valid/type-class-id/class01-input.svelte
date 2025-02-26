<a class="link">Click me!</a>

<a class="bold">Click me two!</a>

<b class="bold">Text 1</b>

<b class="link">Text 2</b>

<b data-key="val">Text 3</b>

<b class:conditional={true}>Text 4</b>

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
