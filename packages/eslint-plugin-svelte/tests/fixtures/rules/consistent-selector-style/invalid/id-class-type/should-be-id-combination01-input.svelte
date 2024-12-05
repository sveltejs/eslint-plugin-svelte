<a class="link">Click me!</a>

<a>Click me two!</a>

<b class="bold">Text 1</b>

<b data-key="val">Text 3</b>

<i>Italic</i>

<style>
  .link,
  .bold,
  .link:active,
  .link + .bold,
  .bold[data-key="val"],
  .bold::before,
  i,
  i:active,
  .bold + i,
  i::before {
    color: red;
  }
</style>
