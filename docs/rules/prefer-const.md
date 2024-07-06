---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'svelte/prefer-const'
description: 'Require `const` declarations for variables that are never reassigned after declared (excludes reactive values).'
---

# svelte/prefer-const

> Require `const` declarations for variables that are never reassigned after declared (excludes reactive values).

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

Based on https://eslint.org/docs/latest/rules/prefer-const but skips reactive variables created by runes.

## :mag: Implementation

- [Rule source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/src/rules/prefer-const.ts)
- [Test source](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/tests/src/rules/prefer-const.ts)
