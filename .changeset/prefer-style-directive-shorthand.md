---
'eslint-plugin-svelte': patch
---

fix(prefer-style-directive): do not autofix when a shorthand, longhand, physical/logical counterpart, or alias of the property is also set, or when another part of the style is unknown, since the fix can change the style
