<!-- prettier-ignore -->
<script lang="ts">
  type T =
    `foo`
  ;
  type U = 
    `foo${
      'bar'
    }`
  ;
  type Color = "red" | "blue";
  type Quantity = "one" | "two";
  type SeussFish = 
    `${
      Quantity
      | 
      Color
    } fish`
  ;
  type EnthusiasticGreeting<T extends string> = 
    `${
      Uppercase<
        T
      >
    } - ${
      Lowercase<
        T
      >
    } - ${
      Capitalize<
        T
      >
    } - ${
      Uncapitalize<
        T
      >
    }`
  ;
  type HELLO = EnthusiasticGreeting<"heLLo">;

</script>

<!--tests/fixtures/rules/indent/invalid/ts/ts-template-literal-type01-input.svelte-->
