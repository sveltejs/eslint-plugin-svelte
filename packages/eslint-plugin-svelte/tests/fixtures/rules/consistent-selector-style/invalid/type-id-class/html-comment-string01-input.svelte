<a class="link" title="<!--">Click me!</a>

<b class="bold" title="-->">Text</b>

<style>
  .link[title="<!--"],
  <!-- a comment --> .bold {
    color: red;
  }

  <!-- a comment -->
  .link[title='<!--'],
  .bold[title="\"-->"] {
    color: red;
  }
</style>
