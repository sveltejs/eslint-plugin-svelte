---
'eslint-plugin-svelte': patch
---

fix(prefer-style-directive): do not autofix when a shorthand, longhand, or physical/logical counterpart of the property is also set, since the fix can change the style
