export = {
  plugins: ["@ota-meshi/svelte"],
  overrides: [
    {
      files: ["*.svelte"],
      parser: require.resolve("svelte-eslint-parser"),
      rules: {
        // ESLint core rules known to cause problems with `.svelte`.
        // "no-irregular-whitespace": "off",
      },
    },
  ],
}
