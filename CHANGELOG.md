# eslint-plugin-svelte

## 2.36.0-next.1

### Minor Changes

- [#622](https://github.com/sveltejs/eslint-plugin-svelte/pull/622) [`470ef6c`](https://github.com/sveltejs/eslint-plugin-svelte/commit/470ef6cd1ef4767528ff15b5fbdfec1740a5ec02) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: add support for `{@snippet}`and `{@render}` in indent rule

- [#624](https://github.com/sveltejs/eslint-plugin-svelte/pull/624) [`7df5b6f`](https://github.com/sveltejs/eslint-plugin-svelte/commit/7df5b6f0963f1fb8fc9256f8ed6f034e5f7fbf3d) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: add support for `{@snippet}` and `{@render}` in mustache-spacing rule

## 2.36.0-next.0

### Minor Changes

- [#620](https://github.com/sveltejs/eslint-plugin-svelte/pull/620) [`1097107`](https://github.com/sveltejs/eslint-plugin-svelte/commit/1097107afce00fd8b959261b015a4eb1f39f116d) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: (experimental) partial support for Svelte v5

## 2.35.1

### Patch Changes

- [#623](https://github.com/sveltejs/eslint-plugin-svelte/pull/623) [`a8b4bd4`](https://github.com/sveltejs/eslint-plugin-svelte/commit/a8b4bd4bb7c0164f76e4efd19bd8ab6de3185cd6) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: replace deprecated typeParameters with typeArguments

## 2.35.0

### Minor Changes

- [#608](https://github.com/sveltejs/eslint-plugin-svelte/pull/608) [`ff28fd3`](https://github.com/sveltejs/eslint-plugin-svelte/commit/ff28fd328254a0b7327078a878c9486f4db1b7c8) Thanks [@marekdedic](https://github.com/marekdedic)! - feat: added the no-inline-styles rule

- [#605](https://github.com/sveltejs/eslint-plugin-svelte/pull/605) [`ef5f965`](https://github.com/sveltejs/eslint-plugin-svelte/commit/ef5f965024935c9bf6224450243223066789501e) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: use eslint-compat-utils

## 2.34.1

### Patch Changes

- [#604](https://github.com/sveltejs/eslint-plugin-svelte/pull/604) [`796c0ad`](https://github.com/sveltejs/eslint-plugin-svelte/commit/796c0ad5f71dd927989caea109027e1735202c3b) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: false positives for custom-element with svelte v3 in `svelte/valid-compile`

## 2.34.0

### Minor Changes

- [#592](https://github.com/sveltejs/eslint-plugin-svelte/pull/592) [`1fe38d7`](https://github.com/sveltejs/eslint-plugin-svelte/commit/1fe38d770928bb890d4292e6a10028b93d9ba843) Thanks [@moufmouf](https://github.com/moufmouf)! - feat: add new `svelte/no-ignored-unsubscribe` rule.

## 2.33.2

### Patch Changes

- [#585](https://github.com/sveltejs/eslint-plugin-svelte/pull/585) [`d9866a1`](https://github.com/sveltejs/eslint-plugin-svelte/commit/d9866a1396da2374926158034e92464164c061c0) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: false positives for `bind:` with member in `svelte/no-immutable-reactive-statements` rule

## 2.33.1

### Patch Changes

- [#581](https://github.com/sveltejs/eslint-plugin-svelte/pull/581) [`1645a9e`](https://github.com/sveltejs/eslint-plugin-svelte/commit/1645a9eb28519051f997c019ed95347055a76959) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: false positives for mutable member in `svelte/no-immutable-reactive-statements` rule

## 2.33.0

### Minor Changes

- [#565](https://github.com/sveltejs/eslint-plugin-svelte/pull/565) [`bd11057`](https://github.com/sveltejs/eslint-plugin-svelte/commit/bd110572cafc9c7323e6f2d0407bb237d0f32708) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: change dependency parser version

## 2.32.4

### Patch Changes

- [#551](https://github.com/sveltejs/eslint-plugin-svelte/pull/551) [`a17a6e0`](https://github.com/sveltejs/eslint-plugin-svelte/commit/a17a6e003e8321aca0b9b95d1a401bf7f8966451) Thanks [@renovate](https://github.com/apps/renovate)! - fix(deps): update dependency known-css-properties to ^0.28.0

## 2.32.3

### Patch Changes

- [#548](https://github.com/sveltejs/eslint-plugin-svelte/pull/548) [`68e7724`](https://github.com/sveltejs/eslint-plugin-svelte/commit/68e77240499b93a1fe0d31d0defa8e42d48a6e5d) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: typescript-eslint v6 compatibility

## 2.32.2

### Patch Changes

- [#530](https://github.com/sveltejs/eslint-plugin-svelte/pull/530) [`c584404`](https://github.com/sveltejs/eslint-plugin-svelte/commit/c584404bd5a2134d81067abbd3c01525abc8e9f7) Thanks [@pawelblaszczyk5](https://github.com/pawelblaszczyk5)! - fix: handle type aliases for $Events and $Slots declarations

## 2.32.1

### Patch Changes

- [#527](https://github.com/sveltejs/eslint-plugin-svelte/pull/527) [`0212a78`](https://github.com/sveltejs/eslint-plugin-svelte/commit/0212a78541e2ff51305c3b75f115dabcba73ab78) Thanks [@marekdedic](https://github.com/marekdedic)! - fix(no-ununsed-class-name): fixed an error with `@use` at-rules

## 2.32.0

### Minor Changes

- [#520](https://github.com/sveltejs/eslint-plugin-svelte/pull/520) [`8ba5fb1`](https://github.com/sveltejs/eslint-plugin-svelte/commit/8ba5fb102d39310cdd5756245bb1f388e432a7a0) Thanks [@marekdedic](https://github.com/marekdedic)! - feat(no-unused-class-name): added an option to allow some specific class names

- [#524](https://github.com/sveltejs/eslint-plugin-svelte/pull/524) [`1e0346e`](https://github.com/sveltejs/eslint-plugin-svelte/commit/1e0346ef287089cf2b9169abf319d81e52993630) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: add support for Svelte v4

- [#525](https://github.com/sveltejs/eslint-plugin-svelte/pull/525) [`20412ab`](https://github.com/sveltejs/eslint-plugin-svelte/commit/20412ab756154291e36671e31c41a0ca7c3c7f97) Thanks [@renovate](https://github.com/apps/renovate)! - fix(deps): update dependency svelte-eslint-parser to ^0.32.0

### Patch Changes

- [#511](https://github.com/sveltejs/eslint-plugin-svelte/pull/511) [`bb30943`](https://github.com/sveltejs/eslint-plugin-svelte/commit/bb309430f45b49e86b3c4cb6fd53d6e57ea37a86) Thanks [@marekdedic](https://github.com/marekdedic)! - feat(block-lang): added support for multiple modules of the same type

## 2.31.1

### Patch Changes

- [#514](https://github.com/sveltejs/eslint-plugin-svelte/pull/514) [`95ed14e`](https://github.com/sveltejs/eslint-plugin-svelte/commit/95ed14ef4a59bfa25f3dd74403d583eb45df75f8) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: `plugin:svelte/all` config

- [#517](https://github.com/sveltejs/eslint-plugin-svelte/pull/517) [`c1f27c4`](https://github.com/sveltejs/eslint-plugin-svelte/commit/c1f27c4a89e744131aa3ec93d9ad2cceddd84412) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: false positive for `customElement="..."` in `svelte/valid-compile`

- [#515](https://github.com/sveltejs/eslint-plugin-svelte/pull/515) [`1ecdfee`](https://github.com/sveltejs/eslint-plugin-svelte/commit/1ecdfeedd47cfe81cc8c121c847a05bfbdfdb76e) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: crash with non svelte files in `svelte/no-unused-class-name`

## 2.31.0

### Minor Changes

- [#489](https://github.com/sveltejs/eslint-plugin-svelte/pull/489) [`cc321f4`](https://github.com/sveltejs/eslint-plugin-svelte/commit/cc321f4182fe71b0b1f136d6ede37c509a402c25) Thanks [@marekdedic](https://github.com/marekdedic)! - feat: added the no-unused-class-name rule

- [#504](https://github.com/sveltejs/eslint-plugin-svelte/pull/504) [`ab9e6e7`](https://github.com/sveltejs/eslint-plugin-svelte/commit/ab9e6e7f64537747a31826d9ff3758350f0b0f59) Thanks [@renovate](https://github.com/apps/renovate)! - fix(deps): update dependency svelte-eslint-parser to ^0.31.0

- [#499](https://github.com/sveltejs/eslint-plugin-svelte/pull/499) [`16d6816`](https://github.com/sveltejs/eslint-plugin-svelte/commit/16d6816bbfec66ad89bbbe59429c74c6a21542df) Thanks [@baseballyama](https://github.com/baseballyama)! - feat: add `no-restricted-html-elements` rule

## 2.30.0

### Minor Changes

- [#494](https://github.com/sveltejs/eslint-plugin-svelte/pull/494) [`e5ea6fe`](https://github.com/sveltejs/eslint-plugin-svelte/commit/e5ea6fe641788e05339f468ce6c3d818df7b2446) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: add experimental support for Svelte v4

- [#494](https://github.com/sveltejs/eslint-plugin-svelte/pull/494) [`e5ea6fe`](https://github.com/sveltejs/eslint-plugin-svelte/commit/e5ea6fe641788e05339f468ce6c3d818df7b2446) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix(deps): update dependency svelte-eslint-parser to ^0.30.0

## 2.29.0

### Minor Changes

- [#486](https://github.com/sveltejs/eslint-plugin-svelte/pull/486) [`011de46`](https://github.com/sveltejs/eslint-plugin-svelte/commit/011de46248d13425ed6a1afc45f8102d32505b4c) Thanks [@renovate](https://github.com/apps/renovate)! - fix(deps): update dependency svelte-eslint-parser to ^0.29.0

## 2.28.0

### Minor Changes

- [#470](https://github.com/sveltejs/eslint-plugin-svelte/pull/470) [`6290345`](https://github.com/sveltejs/eslint-plugin-svelte/commit/6290345134d6cc5ef7a0bbe4b437918e61794150) Thanks [@renovate](https://github.com/apps/renovate)! - fix(deps): update dependency svelte-eslint-parser to ^0.28.0

- [#473](https://github.com/sveltejs/eslint-plugin-svelte/pull/473) [`6b71add`](https://github.com/sveltejs/eslint-plugin-svelte/commit/6b71addc4a6963afcb6c861fc9190562a8ccbaf7) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: add `svelte/require-each-key` rule

- [#475](https://github.com/sveltejs/eslint-plugin-svelte/pull/475) [`abac19f`](https://github.com/sveltejs/eslint-plugin-svelte/commit/abac19f16c1a5c245034cad1d1e616905962f91f) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: add `svelte/valid-each-key` rule

- [#467](https://github.com/sveltejs/eslint-plugin-svelte/pull/467) [`170f816`](https://github.com/sveltejs/eslint-plugin-svelte/commit/170f816bd733a45103bdc8e82cc8e4768498dd4b) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: export meta object

## 2.27.4

### Patch Changes

- [#465](https://github.com/sveltejs/eslint-plugin-svelte/pull/465) [`c8c98d4`](https://github.com/sveltejs/eslint-plugin-svelte/commit/c8c98d4dceca3a7bff56f6ea9558579bbc26be27) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: false positives for builtin `$$` vars in `svelte/no-immutable-reactive-statements`

- [#464](https://github.com/sveltejs/eslint-plugin-svelte/pull/464) [`fcb7226`](https://github.com/sveltejs/eslint-plugin-svelte/commit/fcb722663535a7d8b6b39ff438e48a5e850a6bc9) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: false positives for builtin `$$` vars in `svelte/prefer-destructured-store-props`

## 2.27.3

### Patch Changes

- [#461](https://github.com/sveltejs/eslint-plugin-svelte/pull/461) [`295091b`](https://github.com/sveltejs/eslint-plugin-svelte/commit/295091ba5808a4d2828d4cb4a6d6aaff36515b66) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: disable no-self-assign rule (take2)

## 2.27.2

### Patch Changes

- [#455](https://github.com/sveltejs/eslint-plugin-svelte/pull/455) [`bfd8a29`](https://github.com/sveltejs/eslint-plugin-svelte/commit/bfd8a296ff852b58ba11a4854e7815f8fc7d7443) Thanks [@baseballyama](https://github.com/baseballyama)! - disable `no-self-assign` rule in Svelte files

## 2.27.1

### Patch Changes

- [#451](https://github.com/sveltejs/eslint-plugin-svelte/pull/451) [`df9ed9e`](https://github.com/sveltejs/eslint-plugin-svelte/commit/df9ed9e98011a42275b143920b1dbdc500cb3fec) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: broken import when not using typescript-eslint

## 2.27.0

### Minor Changes

- [#439](https://github.com/sveltejs/eslint-plugin-svelte/pull/439) [`f810b69`](https://github.com/sveltejs/eslint-plugin-svelte/commit/f810b694e2b3bc1bad0daba8227bcd672a8cb454) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: add `svelte/no-immutable-reactive-statements` rule

- [#447](https://github.com/sveltejs/eslint-plugin-svelte/pull/447) [`9b5198c`](https://github.com/sveltejs/eslint-plugin-svelte/commit/9b5198c8c9606e50867c95a6bc2b5ae4fe948c8d) Thanks [@renovate](https://github.com/apps/renovate)! - fix(deps): update dependency svelte-eslint-parser to ^0.27.0

- [#440](https://github.com/sveltejs/eslint-plugin-svelte/pull/440) [`ed68b20`](https://github.com/sveltejs/eslint-plugin-svelte/commit/ed68b205c2ff9c80237c06b453e9de3957a4f090) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: add `svelte/no-reactive-reassign` rule

## 2.26.0

### Minor Changes

- [#433](https://github.com/sveltejs/eslint-plugin-svelte/pull/433) [`890cfa2`](https://github.com/sveltejs/eslint-plugin-svelte/commit/890cfa268b2473fb770de9d79682078f97c9e295) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: update svelte-eslint-parser to add support for `<svelte:document>`

## 2.25.0

### Minor Changes

- [#428](https://github.com/sveltejs/eslint-plugin-svelte/pull/428) [`89925ea`](https://github.com/sveltejs/eslint-plugin-svelte/commit/89925eaf45b94b91e0c0c37fa754652f807e225d) Thanks [@ota-meshi](https://github.com/ota-meshi)! - chore: move repo and move url of rule docs

## 2.24.0

### Minor Changes

- [#425](https://github.com/sveltejs/eslint-plugin-svelte/pull/425) [`2f08a42`](https://github.com/sveltejs/eslint-plugin-svelte/commit/2f08a421cc6317d4b2c06325ae1c9105df6a110e) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: update svelte-eslint-parser to v0.25

## 2.23.1

### Patch Changes

- [#420](https://github.com/sveltejs/eslint-plugin-svelte/pull/420) [`4ae07d9`](https://github.com/sveltejs/eslint-plugin-svelte/commit/4ae07d93a4102504afd9f37a38ff0e90de075a79) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: false positive for containing element in `svelte/no-unused-svelte-ignore`

## 2.23.0

### Minor Changes

- [#403](https://github.com/sveltejs/eslint-plugin-svelte/pull/403) [`c171d9c`](https://github.com/sveltejs/eslint-plugin-svelte/commit/c171d9c1a3ea80359db46d925cdce06c8dff4d5b) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: use `@eslint-community` packages

### Patch Changes

- [#415](https://github.com/sveltejs/eslint-plugin-svelte/pull/415) [`9714749`](https://github.com/sveltejs/eslint-plugin-svelte/commit/97147490f72b09602bd8667c9fe00131b2fb8bbc) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: ignore indent for inline style tags in `svelte/indent` rule

- [#418](https://github.com/sveltejs/eslint-plugin-svelte/pull/418) [`fe306ed`](https://github.com/sveltejs/eslint-plugin-svelte/commit/fe306ed81223a0379147421bab1dd0176941fb6f) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: maximum call stack error in `svelte/infinite-reactive-loop` rule

## 2.22.0

### Minor Changes

- [#407](https://github.com/sveltejs/eslint-plugin-svelte/pull/407) [`c394a80`](https://github.com/sveltejs/eslint-plugin-svelte/commit/c394a80fd5aaa68236563f44d4ef0afb7424bc33) Thanks [@DetachHead](https://github.com/DetachHead)! - add `all` config which enables every rule

## 2.21.0

### Minor Changes

- [#399](https://github.com/sveltejs/eslint-plugin-svelte/pull/399) [`0e102c2`](https://github.com/sveltejs/eslint-plugin-svelte/commit/0e102c2a5c1b6feeece43615b4a0eb3b06acb0b7) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: update svelte-eslint-parser to v0.24

## 2.20.2

### Patch Changes

- [#397](https://github.com/sveltejs/eslint-plugin-svelte/pull/397) [`7b0d70b`](https://github.com/sveltejs/eslint-plugin-svelte/commit/7b0d70b4d85c6090b84c5de51d1215e2d3ebddeb) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: `ReferenceTracker` usage

## 2.20.1

### Patch Changes

- [#394](https://github.com/sveltejs/eslint-plugin-svelte/pull/394) [`4c5be6f`](https://github.com/sveltejs/eslint-plugin-svelte/commit/4c5be6f0c96c1c08e8c5878ece6af55bb2f35266) Thanks [@marekdedic](https://github.com/marekdedic)! - fix(block-lang): fixed false positives for non-svelte files

## 2.20.0

### Minor Changes

- [#389](https://github.com/sveltejs/eslint-plugin-svelte/pull/389) [`6039793`](https://github.com/sveltejs/eslint-plugin-svelte/commit/6039793f6e1243f2180564ea992f762ecf1c5ab2) Thanks [@marekdedic](https://github.com/marekdedic)! - feat: added the `svelte/block-lang` rule

## 2.19.2

### Patch Changes

- [#387](https://github.com/sveltejs/eslint-plugin-svelte/pull/387) [`6422ee8`](https://github.com/sveltejs/eslint-plugin-svelte/commit/6422ee89fcb5c8cefceda7dfa5b78e411c27f557) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: false positive for element in `svelte/no-unused-svelte-ignore`

## 2.19.1

### Patch Changes

- [#383](https://github.com/sveltejs/eslint-plugin-svelte/pull/383) [`08aace5`](https://github.com/sveltejs/eslint-plugin-svelte/commit/08aace561ab4f013b4eda47f829bc7fa545d5c9f) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: false positives for read property in `svelte/no-dom-manipulating`

## 2.19.0

### Minor Changes

- [#375](https://github.com/sveltejs/eslint-plugin-svelte/pull/375) [`d692baf`](https://github.com/sveltejs/eslint-plugin-svelte/commit/d692baf88637c8aca066d4abe62450b2b9f9940f) Thanks [@ptrxyz](https://github.com/ptrxyz)! - Change to use `parserServices.program.getCompilerOptions().target` for TS transpile in `svelte/valid-compile` rule.

## 2.18.0

### Minor Changes

- [#368](https://github.com/sveltejs/eslint-plugin-svelte/pull/368) [`fcb5e31`](https://github.com/sveltejs/eslint-plugin-svelte/commit/fcb5e319620b1cc71ffe579760033813bd719410) Thanks [@marekdedic](https://github.com/marekdedic)! - feat: added the `svelte/experimental-require-slot-types` rule

- [#365](https://github.com/sveltejs/eslint-plugin-svelte/pull/365) [`e61bbc3`](https://github.com/sveltejs/eslint-plugin-svelte/commit/e61bbc347f416f19e9e1e026c4d692e404776023) Thanks [@marekdedic](https://github.com/marekdedic)! - feat: added the `svelte/experimental-require-strict-events` rule

## 2.17.0

### Minor Changes

- [#366](https://github.com/sveltejs/eslint-plugin-svelte/pull/366) [`a1fe4ac`](https://github.com/sveltejs/eslint-plugin-svelte/commit/a1fe4aca6fbc5620d831ae93195faa4863936855) Thanks [@baseballyama](https://github.com/baseballyama)! - Support `snapshot` to `valid-prop-names-in-kit-pages` rule

## 2.16.0

### Minor Changes

- [#358](https://github.com/sveltejs/eslint-plugin-svelte/pull/358) [`3464f23`](https://github.com/sveltejs/eslint-plugin-svelte/commit/3464f2340ee1a45a4f50900eafe6435af9ba2931) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: update svelte-eslint-parser to v0.23

- [#332](https://github.com/sveltejs/eslint-plugin-svelte/pull/332) [`26870cf`](https://github.com/sveltejs/eslint-plugin-svelte/commit/26870cf4eae7c682ae9d2741194fc23fdca9112e) Thanks [@baseballyama](https://github.com/baseballyama)! - feat: add `svelte/nfinite-reactive-loop` rule

- [#354](https://github.com/sveltejs/eslint-plugin-svelte/pull/354) [`2f1d89a`](https://github.com/sveltejs/eslint-plugin-svelte/commit/2f1d89a4cbb5845aa328f5889dd449c386f04bda) Thanks [@marekdedic](https://github.com/marekdedic)! - feat: added the `svelte/require-event-dispatcher-types` rule

### Patch Changes

- [#357](https://github.com/sveltejs/eslint-plugin-svelte/pull/357) [`a561f99`](https://github.com/sveltejs/eslint-plugin-svelte/commit/a561f995a426ccb2d9a4066fc8cc264efbb74d7e) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: false positives for ts in `svelte/no-unused-svelte-ignore`

## 2.15.0

### Minor Changes

- [#349](https://github.com/sveltejs/eslint-plugin-svelte/pull/349) [`b3f6fd5`](https://github.com/sveltejs/eslint-plugin-svelte/commit/b3f6fd50169a45e2efc229f9f132635a1c8a3136) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: improved loading of external modules

### Patch Changes

- [#351](https://github.com/sveltejs/eslint-plugin-svelte/pull/351) [`aa7ab6c`](https://github.com/sveltejs/eslint-plugin-svelte/commit/aa7ab6cacb502eac046d89ecc5ff63b07f7118f8) Thanks [@SiNONiMiTY](https://github.com/SiNONiMiTY)! - fix(deps): update sourcemap-codec dependency

- [#353](https://github.com/sveltejs/eslint-plugin-svelte/pull/353) [`5933794`](https://github.com/sveltejs/eslint-plugin-svelte/commit/593379470019210bf9104bc260dffacb8976f8f5) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: false positives for `form` in `svelte/valid-prop-names-in-kit-pages`

## 2.14.1

### Patch Changes

- [#318](https://github.com/sveltejs/eslint-plugin-svelte/pull/318) [`53d4fda`](https://github.com/sveltejs/eslint-plugin-svelte/commit/53d4fdaf0fe60f78677b6f9b85ed81da553301e5) Thanks [@DetachHead](https://github.com/DetachHead)! - fix `isKitPageComponent` on windows

## 2.14.0

### Minor Changes

- [#310](https://github.com/sveltejs/eslint-plugin-svelte/pull/310) [`6d392c4`](https://github.com/sveltejs/eslint-plugin-svelte/commit/6d392c4ac1d94e6f296858da99454198774c6bec) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: improve `svelte/indent` rule to support more ts syntax

- [#308](https://github.com/sveltejs/eslint-plugin-svelte/pull/308) [`a9c4912`](https://github.com/sveltejs/eslint-plugin-svelte/commit/a9c4912b9d23fe7557786445fa8180a7b35bda21) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: add `svelte/no-dupe-use-directives` rule

- [#308](https://github.com/sveltejs/eslint-plugin-svelte/pull/308) [`a9c4912`](https://github.com/sveltejs/eslint-plugin-svelte/commit/a9c4912b9d23fe7557786445fa8180a7b35bda21) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: add `svelte/no-dupe-on-directives` rule

## 2.13.1

### Patch Changes

- [#306](https://github.com/sveltejs/eslint-plugin-svelte/pull/306) [`48bb4b7`](https://github.com/sveltejs/eslint-plugin-svelte/commit/48bb4b793864dc9689a5f021ae17c2bd08a3e325) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: update svelte-eslint-parser to 0.22

## 2.13.0

### Minor Changes

- [#303](https://github.com/sveltejs/eslint-plugin-svelte/pull/303) [`747eae5`](https://github.com/sveltejs/eslint-plugin-svelte/commit/747eae528d8aadc0d31a64f04baa8f2e557e80c6) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: update svelte-eslint-parser to v0.21

- [#296](https://github.com/sveltejs/eslint-plugin-svelte/pull/296) [`695e2e5`](https://github.com/sveltejs/eslint-plugin-svelte/commit/695e2e50762bf004af9200d7d05958e5cea08f70) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: improve reporting range for `svelte/html-self-closing` rule.

- [#302](https://github.com/sveltejs/eslint-plugin-svelte/pull/302) [`f0d3e68`](https://github.com/sveltejs/eslint-plugin-svelte/commit/f0d3e68f75f6a90d5f245313e96b3987fec6761f) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: add `svelte/no-dom-manipulating` rule

## 2.12.0

### Minor Changes

- [#291](https://github.com/sveltejs/eslint-plugin-svelte/pull/291) [`049ac2d`](https://github.com/sveltejs/eslint-plugin-svelte/commit/049ac2db68a9a3c753cc4e5fdf178795b01d715c) Thanks [@renovate](https://github.com/apps/renovate)! - feat: update dependency svelte-eslint-parser to ^0.20.0

- [#284](https://github.com/sveltejs/eslint-plugin-svelte/pull/284) [`1240968`](https://github.com/sveltejs/eslint-plugin-svelte/commit/1240968523fb7721c6ca3ea5bdf943247be4a099) Thanks [@baseballyama](https://github.com/baseballyama)! - feat: add `require-store-callbacks-use-set-param` rule

- [#281](https://github.com/sveltejs/eslint-plugin-svelte/pull/281) [`8da870f`](https://github.com/sveltejs/eslint-plugin-svelte/commit/8da870fc6c7d2b00a067d8befe124576c623a907) Thanks [@baseballyama](https://github.com/baseballyama)! - feat: add `no-export-load-in-svelte-module-in-kit-pages` rule

- [#283](https://github.com/sveltejs/eslint-plugin-svelte/pull/283) [`909979e`](https://github.com/sveltejs/eslint-plugin-svelte/commit/909979e004f5b069dbd4adb1a53a125ecda110a7) Thanks [@baseballyama](https://github.com/baseballyama)! - feat: add `svelte/valid-prop-names-in-kit-pages` rule

- [#289](https://github.com/sveltejs/eslint-plugin-svelte/pull/289) [`2895f16`](https://github.com/sveltejs/eslint-plugin-svelte/commit/2895f16c0e62cd0e946e549f8fc147aef42c143b) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: add `svelte/require-store-reactive-access` rule

### Patch Changes

- [#286](https://github.com/sveltejs/eslint-plugin-svelte/pull/286) [`8802e14`](https://github.com/sveltejs/eslint-plugin-svelte/commit/8802e1456b3d0c2bf021a3086b5160c51f56b049) Thanks [@renovate](https://github.com/apps/renovate)! - fix(deps): update dependency known-css-properties to ^0.26.0

## 2.11.0

### Minor Changes

- [#274](https://github.com/sveltejs/eslint-plugin-svelte/pull/274) [`9a9ba19`](https://github.com/sveltejs/eslint-plugin-svelte/commit/9a9ba19ee6301de01196a26696fc2ed350238c7f) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: update svelte-eslint-parser to v0.19.0. See [release note](https://github.com/ota-meshi/svelte-eslint-parser/releases/tag/v0.19.0)

- [#276](https://github.com/sveltejs/eslint-plugin-svelte/pull/276) [`e9f7bcf`](https://github.com/sveltejs/eslint-plugin-svelte/commit/e9f7bcf8f96bf33d7f24cac2178b5dbd95f1b72d) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: deprecate `svelte/@typescript-eslint/no-unnecessary-condition` rule

## 2.10.0

### Minor Changes

- [#270](https://github.com/sveltejs/eslint-plugin-svelte/pull/270) [`dc60b36`](https://github.com/sveltejs/eslint-plugin-svelte/commit/dc60b36007d26ce5bc639a87d2a57072d7cf6c89) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: add `svelte/prefer-destructured-store-props` rule

## 2.9.0

### Minor Changes

- [#262](https://github.com/sveltejs/eslint-plugin-svelte/pull/262) [`b732ec6`](https://github.com/sveltejs/eslint-plugin-svelte/commit/b732ec621b1832ddf214ca3bb556d1c0b9ead463) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: add `svelte/@typescript-eslint/no-unnecessary-condition` rule

### Patch Changes

- [#261](https://github.com/sveltejs/eslint-plugin-svelte/pull/261) [`3dae5ab`](https://github.com/sveltejs/eslint-plugin-svelte/commit/3dae5abe1ac9487697784109e31370641efb204f) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: false report in `settings.ignoreWarnings`

## 2.8.0

### Minor Changes

- [#249](https://github.com/sveltejs/eslint-plugin-svelte/pull/249) [`6d0b89f`](https://github.com/sveltejs/eslint-plugin-svelte/commit/6d0b89f644b160b94293f4f0a63d5cef4bb032e4) Thanks [@baseballyama](https://github.com/baseballyama)! - feat: add `svelte/derived-has-same-inputs-outputs` rule

## 2.7.0

### Minor Changes

- [#240](https://github.com/sveltejs/eslint-plugin-svelte/pull/240) [`e56fbdb`](https://github.com/sveltejs/eslint-plugin-svelte/commit/e56fbdb34079567a6c1061909fa7d54cfc91727d) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: add `svelte/no-trailing-spaces` rule
- [#225](https://github.com/sveltejs/eslint-plugin-svelte/pull/225) [`a3888b3`](https://github.com/sveltejs/eslint-plugin-svelte/commit/a3888b3cf358ceaa4ddaf22af19f8124d0ff53e4) Thanks [@baseballyama](https://github.com/baseballyama)! - feat: add `svelte/no-store-async` rule

## 2.6.0

### Minor Changes

- [#216](https://github.com/sveltejs/eslint-plugin-svelte/pull/216) [`9d122ea`](https://github.com/sveltejs/eslint-plugin-svelte/commit/9d122eaee577ffb846051b7cad15f515dbbb2ccb) Thanks [@marekvospel](https://github.com/marekvospel)! - feat(html-self-closing): add configuration presets
