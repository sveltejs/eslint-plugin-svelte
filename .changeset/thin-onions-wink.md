---
'eslint-plugin-svelte': patch
---
Fixed: In runes mode, `svelte-ignore` comment handling now matches the compiler. Only comma-separated codes are read, so prose after a code no longer suppresses warnings or gets reported as an unused ignore. Legacy mode is unchanged: every code in the comment is still read, which fixes space-separated multi-code comments being truncated at the final separator.