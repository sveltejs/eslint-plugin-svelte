<a class="link">Click me!</a>

<a class="link">Click me two!</a>

<b class="bold">Text 1</b>

<b class="bold" data-key="val">Text 2</b>

<i id="italic">Italic</i>

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

  #italic {
    color: red;
  }

  #italic:active {
    color: red;
  }

  b + #italic {
    color: red;
  }

  #italic::before {
    color: red;
  }
</style>
