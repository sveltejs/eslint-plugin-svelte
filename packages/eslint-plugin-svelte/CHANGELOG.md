# eslint-plugin-svelte

## 3.0.0

### Major Changes

- [#937](https://github.com/sveltejs/eslint-plugin-svelte/pull/937) [`729394e`](https://github.com/sveltejs/eslint-plugin-svelte/commit/729394e34d2d6f51e00c89b67a40d0f9192260b4) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat!: drop support for old eslint

- [#1033](https://github.com/sveltejs/eslint-plugin-svelte/pull/1033) [`3bfcc31`](https://github.com/sveltejs/eslint-plugin-svelte/commit/3bfcc31e0f2d127c7a1cb838c4c57125c30109ea) Thanks [@baseballyama](https://github.com/baseballyama)! - **Enabled in recommended config**:

  - `svelte/infinite-reactive-loop`
  - `svelte/no-dom-manipulating`
  - `svelte/no-dupe-on-directives`
  - `svelte/no-dupe-use-directives`
  - `svelte/no-export-load-in-svelte-module-in-kit-pages`
  - `svelte/no-immutable-reactive-statements`
  - `svelte/no-inspect`
  - `svelte/no-raw-special-elements`
  - `svelte/no-reactive-functions`
  - `svelte/no-reactive-literals`
  - `svelte/no-reactive-reassign`
  - `svelte/no-store-async`
  - `svelte/no-svelte-internal`
  - `svelte/no-useless-children-snippet`
  - `svelte/no-useless-mustaches`
  - `svelte/require-each-key`
  - `svelte/require-event-dispatcher-types`
  - `svelte/require-store-reactive-access`
  - `svelte/require-stores-init`
  - `svelte/valid-each-key`
  - `svelte/valid-prop-names-in-kit-pages`

  **Removed from recommended config**:

  - `svelte/valid-compile`

  This update introduces breaking changes due to newly enabled rules.

- [#1043](https://github.com/sveltejs/eslint-plugin-svelte/pull/1043) [`778427e`](https://github.com/sveltejs/eslint-plugin-svelte/commit/778427e8bd1a015247dd7f19642e2c6ced0891a8) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: add `*.svelte.{js,ts}` config to base config

- [#900](https://github.com/sveltejs/eslint-plugin-svelte/pull/900) [`4759b47`](https://github.com/sveltejs/eslint-plugin-svelte/commit/4759b47b195abee605a0597360fc9fc4c6d95f68) Thanks [@marekdedic](https://github.com/marekdedic)! - breaking: deprecated the no-goto-without-base rule

- [#885](https://github.com/sveltejs/eslint-plugin-svelte/pull/885) [`ce2ffad`](https://github.com/sveltejs/eslint-plugin-svelte/commit/ce2ffad105b1c6ed2df02a9c2b84f3b654d99ad5) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat!: drop support for old node versions (<18, 19, 21)

- [#1011](https://github.com/sveltejs/eslint-plugin-svelte/pull/1011) [`7596287`](https://github.com/sveltejs/eslint-plugin-svelte/commit/7596287c9d1a0a31c90e23875f6b7beab20747f1) Thanks [@baseballyama](https://github.com/baseballyama)! - breaking: deprecate the `svelte/no-dynamic-slot-name` rule

- [#930](https://github.com/sveltejs/eslint-plugin-svelte/pull/930) [`eae1b4f`](https://github.com/sveltejs/eslint-plugin-svelte/commit/eae1b4fcbfbaec926cfa63a5d08eafcb2238bf82) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat!: upgrade svelte-eslint-parser to v1

- [#982](https://github.com/sveltejs/eslint-plugin-svelte/pull/982) [`04fc429`](https://github.com/sveltejs/eslint-plugin-svelte/commit/04fc4292ef68134691ac1808fd92688bd9982d37) Thanks [@baseballyama](https://github.com/baseballyama)! - feat!: Updated the `html-self-closing` rule to follow Svelte5

- [#932](https://github.com/sveltejs/eslint-plugin-svelte/pull/932) [`b136ab4`](https://github.com/sveltejs/eslint-plugin-svelte/commit/b136ab4e54d8ff38f6ba7f49e1209be14dd18b0b) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat!: change the plugin to an ESM-only package

### Minor Changes

- [#980](https://github.com/sveltejs/eslint-plugin-svelte/pull/980) [`0b28198`](https://github.com/sveltejs/eslint-plugin-svelte/commit/0b28198edd78513e5efc4cfb45e8f1120148435e) Thanks [@baseballyama](https://github.com/baseballyama)! - feat: Implement util to conditionally run lint based on Svelte version and SvelteKit routes etc

- [#1013](https://github.com/sveltejs/eslint-plugin-svelte/pull/1013) [`0ef0f99`](https://github.com/sveltejs/eslint-plugin-svelte/commit/0ef0f99e1781e0453598393b846e63bd159c215d) Thanks [@baseballyama](https://github.com/baseballyama)! - feat: add Svelte 5 support to `no-not-function-handler`

- [#900](https://github.com/sveltejs/eslint-plugin-svelte/pull/900) [`4759b47`](https://github.com/sveltejs/eslint-plugin-svelte/commit/4759b47b195abee605a0597360fc9fc4c6d95f68) Thanks [@marekdedic](https://github.com/marekdedic)! - feat: added the no-navigation-without-base rule

- [#925](https://github.com/sveltejs/eslint-plugin-svelte/pull/925) [`faf90ef`](https://github.com/sveltejs/eslint-plugin-svelte/commit/faf90ef9a6aab3ec647c30df67a54a25d8322324) Thanks [@marekdedic](https://github.com/marekdedic)! - feat: added the `consistent-selector-style` rule

- [#945](https://github.com/sveltejs/eslint-plugin-svelte/pull/945) [`19f682b`](https://github.com/sveltejs/eslint-plugin-svelte/commit/19f682b73ce6bcccae52da0e59d5ab32a9d2c3c2) Thanks [@baseballyama](https://github.com/baseballyama)! - feat: Support `<svelte:boundary>`

- [#844](https://github.com/sveltejs/eslint-plugin-svelte/pull/844) [`2bbd049`](https://github.com/sveltejs/eslint-plugin-svelte/commit/2bbd0497ab7e05db0aab3c8958db08e3fdf4b9b2) Thanks [@Winter](https://github.com/Winter)! - feat: Added suggestion to the `block-lang` rule.

- [#984](https://github.com/sveltejs/eslint-plugin-svelte/pull/984) [`35d80a5`](https://github.com/sveltejs/eslint-plugin-svelte/commit/35d80a50f1053666153bfc7221b945055bfb76d1) Thanks [@baseballyama](https://github.com/baseballyama)! - feat: support `warningFilter` in `valid-compile` rule

- [#933](https://github.com/sveltejs/eslint-plugin-svelte/pull/933) [`71eca84`](https://github.com/sveltejs/eslint-plugin-svelte/commit/71eca843c43250591ec6fa2dd1dc547b1074d6ad) Thanks [@mikededo](https://github.com/mikededo)! - Add `prefer-const` rule

- [#918](https://github.com/sveltejs/eslint-plugin-svelte/pull/918) [`5da98c9`](https://github.com/sveltejs/eslint-plugin-svelte/commit/5da98c94f452c8436f26af4172e095fd91f66e1a) Thanks [@mikededo](https://github.com/mikededo)! - Added new `no-deprecated-raw-special-elements` rule

- [#922](https://github.com/sveltejs/eslint-plugin-svelte/pull/922) [`f4a0fa7`](https://github.com/sveltejs/eslint-plugin-svelte/commit/f4a0fa78e06091348d985b5442a390eae47b0f4f) Thanks [@marekdedic](https://github.com/marekdedic)! - feat: added the no-useless-children-snippet rule

- [#836](https://github.com/sveltejs/eslint-plugin-svelte/pull/836) [`3fa90aa`](https://github.com/sveltejs/eslint-plugin-svelte/commit/3fa90aa57a15ad18105b0d80b1ed975f1f782a11) Thanks [@renovate](https://github.com/apps/renovate)! - feat: support for typescript-eslint v8 to `svelte/indent` rule

- [#963](https://github.com/sveltejs/eslint-plugin-svelte/pull/963) [`2c551b2`](https://github.com/sveltejs/eslint-plugin-svelte/commit/2c551b20557bcd53e35479336bf0c25e88a7643b) Thanks [@baseballyama](https://github.com/baseballyama)! - feat: support Svelte5 of `valid-prop-names-in-kit-pages` rule

- [#1054](https://github.com/sveltejs/eslint-plugin-svelte/pull/1054) [`c587629`](https://github.com/sveltejs/eslint-plugin-svelte/commit/c587629ba2a7d7742965367eb3ad797a9075ef8a) Thanks [@marekdedic](https://github.com/marekdedic)! - feat: added the valid-style-parse rule

- [#1015](https://github.com/sveltejs/eslint-plugin-svelte/pull/1015) [`8369eaf`](https://github.com/sveltejs/eslint-plugin-svelte/commit/8369eaf5d2e77fccf0ac9fb3f663d94a2b323a4f) Thanks [@mikededo](https://github.com/mikededo)! - fix!: rename `no-deprecated-raw-special-elements` to `no-raw-special-elements`

- [#911](https://github.com/sveltejs/eslint-plugin-svelte/pull/911) [`452ffed`](https://github.com/sveltejs/eslint-plugin-svelte/commit/452ffed53791cb9e158636bcd80a221d2840cc4a) Thanks [@marekdedic](https://github.com/marekdedic)! - feat(no-inline-styles): allowing transitions by default

### Patch Changes

- [#961](https://github.com/sveltejs/eslint-plugin-svelte/pull/961) [`117e60d`](https://github.com/sveltejs/eslint-plugin-svelte/commit/117e60d4290966911450c7e0db8566279e4511bb) Thanks [@baseballyama](https://github.com/baseballyama)! - fix: support each blocks without an item

- [#1009](https://github.com/sveltejs/eslint-plugin-svelte/pull/1009) [`a003664`](https://github.com/sveltejs/eslint-plugin-svelte/commit/a0036643b5451f0423cd61dafd092c39bd6f4bcb) Thanks [@baseballyama](https://github.com/baseballyama)! - chore: upgrade `svelte-eslint-parser` to `1.0.0-next.8`

- [#1016](https://github.com/sveltejs/eslint-plugin-svelte/pull/1016) [`91999e3`](https://github.com/sveltejs/eslint-plugin-svelte/commit/91999e3520afe42b3cc51f0823f7c912b97176b4) Thanks [@baseballyama](https://github.com/baseballyama)! - chore: change the rule category of `valid-prop-names-in-kit-pages` to `SvelteKit`

- [#993](https://github.com/sveltejs/eslint-plugin-svelte/pull/993) [`b97a13e`](https://github.com/sveltejs/eslint-plugin-svelte/commit/b97a13eb02f9c72346f29e64734f0a304890a197) Thanks [@baseballyama](https://github.com/baseballyama)! - chore: add `:exit` for each node listener

- [#1048](https://github.com/sveltejs/eslint-plugin-svelte/pull/1048) [`513806c`](https://github.com/sveltejs/eslint-plugin-svelte/commit/513806cafe221487afd32bdcaa33ba8852dc881f) Thanks [@baseballyama](https://github.com/baseballyama)! - fix: allow `children` in `valid-prop-names-in-kit-pages` rule

- [#1012](https://github.com/sveltejs/eslint-plugin-svelte/pull/1012) [`763cf7a`](https://github.com/sveltejs/eslint-plugin-svelte/commit/763cf7ace209dfb90cf7d1d7e6699a6c0fe240d6) Thanks [@baseballyama](https://github.com/baseballyama)! - chore: change the rule category of `no-export-load-in-svelte-module-in-kit-pages` to `SvelteKit`

- [#1021](https://github.com/sveltejs/eslint-plugin-svelte/pull/1021) [`6557c69`](https://github.com/sveltejs/eslint-plugin-svelte/commit/6557c69d7f3595cdf226e681cadf3d0df4c5d972) Thanks [@baseballyama](https://github.com/baseballyama)! - chore: update `svelte-eslint-parser` to `1.0.0-next.10`

- [#956](https://github.com/sveltejs/eslint-plugin-svelte/pull/956) [`157ee1f`](https://github.com/sveltejs/eslint-plugin-svelte/commit/157ee1fade79aab88f01d125b0b01cf375da4cd1) Thanks [@baseballyama](https://github.com/baseballyama)! - chore: update `svelte-eslint-parser` to v1.0.0-next.4

- [#965](https://github.com/sveltejs/eslint-plugin-svelte/pull/965) [`47760ad`](https://github.com/sveltejs/eslint-plugin-svelte/commit/47760ad1b7f6b83d4c29380b3ef3cf09cde42dc8) Thanks [@marekdedic](https://github.com/marekdedic)! - chore: using svelte-eslint-parser for style selector parsing

- [#990](https://github.com/sveltejs/eslint-plugin-svelte/pull/990) [`12049c0`](https://github.com/sveltejs/eslint-plugin-svelte/commit/12049c026f529feff6056e679ba62f07de948aa5) Thanks [@baseballyama](https://github.com/baseballyama)! - fix: ignore `css_unused_selector` compile error if `<style>` tag has `global` attribute

- [#1035](https://github.com/sveltejs/eslint-plugin-svelte/pull/1035) [`f16729f`](https://github.com/sveltejs/eslint-plugin-svelte/commit/f16729f55877b1768ec8d240fd8e416f141781ce) Thanks [@baseballyama](https://github.com/baseballyama)! - chore: run `require-event-dispatcher-types` rule on Svelte 3/4 only

- [#1040](https://github.com/sveltejs/eslint-plugin-svelte/pull/1040) [`ac7115c`](https://github.com/sveltejs/eslint-plugin-svelte/commit/ac7115c74b3f1e82ef15be81d9ef2026da76bb11) Thanks [@baseballyama](https://github.com/baseballyama)! - fix: account for \n and \r in `TemplateLiteral` handling for the `no-useless-mustaches` rule

- [#1020](https://github.com/sveltejs/eslint-plugin-svelte/pull/1020) [`eae0e2e`](https://github.com/sveltejs/eslint-plugin-svelte/commit/eae0e2e52c2812ea630eea45e5be4f439191c806) Thanks [@baseballyama](https://github.com/baseballyama)! - chore: update `svelte-eslint-parser` to `1.0.0-next.9`

- [#1017](https://github.com/sveltejs/eslint-plugin-svelte/pull/1017) [`806d72a`](https://github.com/sveltejs/eslint-plugin-svelte/commit/806d72ad55908fb967252ea0514672b026a6bd09) Thanks [@baseballyama](https://github.com/baseballyama)! - chore: do not run `no-reactive-functions` rule on Svelte 5 with runes

- [#1014](https://github.com/sveltejs/eslint-plugin-svelte/pull/1014) [`74373ec`](https://github.com/sveltejs/eslint-plugin-svelte/commit/74373ec77aa9063c64657faefc01ca331e27b599) Thanks [@baseballyama](https://github.com/baseballyama)! - chore: do not run `no-reactive-reassign` rule on Svelte 5 with runes

- [#1026](https://github.com/sveltejs/eslint-plugin-svelte/pull/1026) [`1bed311`](https://github.com/sveltejs/eslint-plugin-svelte/commit/1bed311084c58a9893e2b578f8b34c2fcb2e8d8b) Thanks [@baseballyama](https://github.com/baseballyama)! - chore: update `svelte-eslint-parser` to `v1.0.0-next.12`

- [#941](https://github.com/sveltejs/eslint-plugin-svelte/pull/941) [`fce2f74`](https://github.com/sveltejs/eslint-plugin-svelte/commit/fce2f74b4b2fe8185742f0411739103301f8ea9f) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: crash with eslint v9.16.0 in `svelte/no-inner-declarations`

- [#1018](https://github.com/sveltejs/eslint-plugin-svelte/pull/1018) [`5bdc906`](https://github.com/sveltejs/eslint-plugin-svelte/commit/5bdc906fc1e32835ab3b75dfd2a6a08b4cbb968b) Thanks [@baseballyama](https://github.com/baseballyama)! - chore: run the `no-inspect` rule only in Svelte 5’s runes mode

- [#1006](https://github.com/sveltejs/eslint-plugin-svelte/pull/1006) [`5fd91ba`](https://github.com/sveltejs/eslint-plugin-svelte/commit/5fd91baa1835cbffc58a8c473ccf70f3f02a34e6) Thanks [@baseballyama](https://github.com/baseballyama)! - chore: do not run `infinite-reactive-loop` rule on Svelte 5 with runes

- [#1031](https://github.com/sveltejs/eslint-plugin-svelte/pull/1031) [`e50d2d4`](https://github.com/sveltejs/eslint-plugin-svelte/commit/e50d2d4a8820c222696c049e0b01988626845584) Thanks [@baseballyama](https://github.com/baseballyama)! - chore: do not run `no-reactive-literals` rule on Svelte 5 with runes

- [#1032](https://github.com/sveltejs/eslint-plugin-svelte/pull/1032) [`722b36c`](https://github.com/sveltejs/eslint-plugin-svelte/commit/722b36ce3b8a16b965f61701dead22b95c7e8b3d) Thanks [@baseballyama](https://github.com/baseballyama)! - chore: run `no-useless-children-snippet` rule on Svelte 5 only

- [#1007](https://github.com/sveltejs/eslint-plugin-svelte/pull/1007) [`8e9199a`](https://github.com/sveltejs/eslint-plugin-svelte/commit/8e9199ae326110778e4b0557616d394c6ac5e847) Thanks [@baseballyama](https://github.com/baseballyama)! - fix: update method for extracting major version

## 3.0.0-next.18

### Patch Changes

- [#1048](https://github.com/sveltejs/eslint-plugin-svelte/pull/1048) [`513806c`](https://github.com/sveltejs/eslint-plugin-svelte/commit/513806cafe221487afd32bdcaa33ba8852dc881f) Thanks [@baseballyama](https://github.com/baseballyama)! - fix: allow `children` in `valid-prop-names-in-kit-pages` rule

## 3.0.0-next.17

### Major Changes

- [#1043](https://github.com/sveltejs/eslint-plugin-svelte/pull/1043) [`778427e`](https://github.com/sveltejs/eslint-plugin-svelte/commit/778427e8bd1a015247dd7f19642e2c6ced0891a8) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: add `*.svelte.{js,ts}` config to base config

## 3.0.0-next.16

### Major Changes

- [#1033](https://github.com/sveltejs/eslint-plugin-svelte/pull/1033) [`3bfcc31`](https://github.com/sveltejs/eslint-plugin-svelte/commit/3bfcc31e0f2d127c7a1cb838c4c57125c30109ea) Thanks [@baseballyama](https://github.com/baseballyama)! - **Enabled in recommended config**:

  - `svelte/infinite-reactive-loop`
  - `svelte/no-dom-manipulating`
  - `svelte/no-dupe-on-directives`
  - `svelte/no-dupe-use-directives`
  - `svelte/no-export-load-in-svelte-module-in-kit-pages`
  - `svelte/no-immutable-reactive-statements`
  - `svelte/no-inspect`
  - `svelte/no-raw-special-elements`
  - `svelte/no-reactive-functions`
  - `svelte/no-reactive-literals`
  - `svelte/no-reactive-reassign`
  - `svelte/no-store-async`
  - `svelte/no-svelte-internal`
  - `svelte/no-useless-children-snippet`
  - `svelte/no-useless-mustaches`
  - `svelte/require-each-key`
  - `svelte/require-event-dispatcher-types`
  - `svelte/require-store-reactive-access`
  - `svelte/require-stores-init`
  - `svelte/valid-each-key`
  - `svelte/valid-prop-names-in-kit-pages`

  **Removed from recommended config**:

  - `svelte/valid-compile`

  This update introduces breaking changes due to newly enabled rules.

- [#1011](https://github.com/sveltejs/eslint-plugin-svelte/pull/1011) [`7596287`](https://github.com/sveltejs/eslint-plugin-svelte/commit/7596287c9d1a0a31c90e23875f6b7beab20747f1) Thanks [@baseballyama](https://github.com/baseballyama)! - breaking: deprecate the `svelte/no-dynamic-slot-name` rule

### Minor Changes

- [#1013](https://github.com/sveltejs/eslint-plugin-svelte/pull/1013) [`0ef0f99`](https://github.com/sveltejs/eslint-plugin-svelte/commit/0ef0f99e1781e0453598393b846e63bd159c215d) Thanks [@baseballyama](https://github.com/baseballyama)! - feat: add Svelte 5 support to `no-not-function-handler`

### Patch Changes

- [#1035](https://github.com/sveltejs/eslint-plugin-svelte/pull/1035) [`f16729f`](https://github.com/sveltejs/eslint-plugin-svelte/commit/f16729f55877b1768ec8d240fd8e416f141781ce) Thanks [@baseballyama](https://github.com/baseballyama)! - chore: run `require-event-dispatcher-types` rule on Svelte 3/4 only

- [#1040](https://github.com/sveltejs/eslint-plugin-svelte/pull/1040) [`ac7115c`](https://github.com/sveltejs/eslint-plugin-svelte/commit/ac7115c74b3f1e82ef15be81d9ef2026da76bb11) Thanks [@baseballyama](https://github.com/baseballyama)! - fix: account for \n and \r in `TemplateLiteral` handling for the `no-useless-mustaches` rule

- [#1031](https://github.com/sveltejs/eslint-plugin-svelte/pull/1031) [`e50d2d4`](https://github.com/sveltejs/eslint-plugin-svelte/commit/e50d2d4a8820c222696c049e0b01988626845584) Thanks [@baseballyama](https://github.com/baseballyama)! - chore: do not run `no-reactive-literals` rule on Svelte 5 with runes

- [#1032](https://github.com/sveltejs/eslint-plugin-svelte/pull/1032) [`722b36c`](https://github.com/sveltejs/eslint-plugin-svelte/commit/722b36ce3b8a16b965f61701dead22b95c7e8b3d) Thanks [@baseballyama](https://github.com/baseballyama)! - chore: run `no-useless-children-snippet` rule on Svelte 5 only

## 3.0.0-next.15

### Minor Changes

- [#925](https://github.com/sveltejs/eslint-plugin-svelte/pull/925) [`faf90ef`](https://github.com/sveltejs/eslint-plugin-svelte/commit/faf90ef9a6aab3ec647c30df67a54a25d8322324) Thanks [@marekdedic](https://github.com/marekdedic)! - feat: added the `consistent-selector-style` rule

- [#984](https://github.com/sveltejs/eslint-plugin-svelte/pull/984) [`35d80a5`](https://github.com/sveltejs/eslint-plugin-svelte/commit/35d80a50f1053666153bfc7221b945055bfb76d1) Thanks [@baseballyama](https://github.com/baseballyama)! - feat: support `warningFilter` in `valid-compile` rule

### Patch Changes

- [#1016](https://github.com/sveltejs/eslint-plugin-svelte/pull/1016) [`91999e3`](https://github.com/sveltejs/eslint-plugin-svelte/commit/91999e3520afe42b3cc51f0823f7c912b97176b4) Thanks [@baseballyama](https://github.com/baseballyama)! - chore: change the rule category of `valid-prop-names-in-kit-pages` to `SvelteKit`

- [#1012](https://github.com/sveltejs/eslint-plugin-svelte/pull/1012) [`763cf7a`](https://github.com/sveltejs/eslint-plugin-svelte/commit/763cf7ace209dfb90cf7d1d7e6699a6c0fe240d6) Thanks [@baseballyama](https://github.com/baseballyama)! - chore: change the rule category of `no-export-load-in-svelte-module-in-kit-pages` to `SvelteKit`

- [#1017](https://github.com/sveltejs/eslint-plugin-svelte/pull/1017) [`806d72a`](https://github.com/sveltejs/eslint-plugin-svelte/commit/806d72ad55908fb967252ea0514672b026a6bd09) Thanks [@baseballyama](https://github.com/baseballyama)! - chore: do not run `no-reactive-functions` rule on Svelte 5 with runes

- [#1014](https://github.com/sveltejs/eslint-plugin-svelte/pull/1014) [`74373ec`](https://github.com/sveltejs/eslint-plugin-svelte/commit/74373ec77aa9063c64657faefc01ca331e27b599) Thanks [@baseballyama](https://github.com/baseballyama)! - chore: do not run `no-reactive-reassign` rule on Svelte 5 with runes

- [#1026](https://github.com/sveltejs/eslint-plugin-svelte/pull/1026) [`1bed311`](https://github.com/sveltejs/eslint-plugin-svelte/commit/1bed311084c58a9893e2b578f8b34c2fcb2e8d8b) Thanks [@baseballyama](https://github.com/baseballyama)! - chore: update `svelte-eslint-parser` to `v1.0.0-next.12`

- [#1018](https://github.com/sveltejs/eslint-plugin-svelte/pull/1018) [`5bdc906`](https://github.com/sveltejs/eslint-plugin-svelte/commit/5bdc906fc1e32835ab3b75dfd2a6a08b4cbb968b) Thanks [@baseballyama](https://github.com/baseballyama)! - chore: run the `no-inspect` rule only in Svelte 5’s runes mode

- [#1006](https://github.com/sveltejs/eslint-plugin-svelte/pull/1006) [`5fd91ba`](https://github.com/sveltejs/eslint-plugin-svelte/commit/5fd91baa1835cbffc58a8c473ccf70f3f02a34e6) Thanks [@baseballyama](https://github.com/baseballyama)! - chore: do not run `infinite-reactive-loop` rule on Svelte 5 with runes

## 3.0.0-next.14

### Patch Changes

- [#1021](https://github.com/sveltejs/eslint-plugin-svelte/pull/1021) [`6557c69`](https://github.com/sveltejs/eslint-plugin-svelte/commit/6557c69d7f3595cdf226e681cadf3d0df4c5d972) Thanks [@baseballyama](https://github.com/baseballyama)! - chore: update `svelte-eslint-parser` to `1.0.0-next.10`

## 3.0.0-next.13

### Major Changes

- [#982](https://github.com/sveltejs/eslint-plugin-svelte/pull/982) [`04fc429`](https://github.com/sveltejs/eslint-plugin-svelte/commit/04fc4292ef68134691ac1808fd92688bd9982d37) Thanks [@baseballyama](https://github.com/baseballyama)! - feat!: Updated the `html-self-closing` rule to follow Svelte5

### Minor Changes

- [#1015](https://github.com/sveltejs/eslint-plugin-svelte/pull/1015) [`8369eaf`](https://github.com/sveltejs/eslint-plugin-svelte/commit/8369eaf5d2e77fccf0ac9fb3f663d94a2b323a4f) Thanks [@mikededo](https://github.com/mikededo)! - fix!: rename `no-deprecated-raw-special-elements` to `no-raw-special-elements`

### Patch Changes

- [#1009](https://github.com/sveltejs/eslint-plugin-svelte/pull/1009) [`a003664`](https://github.com/sveltejs/eslint-plugin-svelte/commit/a0036643b5451f0423cd61dafd092c39bd6f4bcb) Thanks [@baseballyama](https://github.com/baseballyama)! - chore: upgrade `svelte-eslint-parser` to `1.0.0-next.8`

- [#1020](https://github.com/sveltejs/eslint-plugin-svelte/pull/1020) [`eae0e2e`](https://github.com/sveltejs/eslint-plugin-svelte/commit/eae0e2e52c2812ea630eea45e5be4f439191c806) Thanks [@baseballyama](https://github.com/baseballyama)! - chore: update `svelte-eslint-parser` to `1.0.0-next.9`

- [#1007](https://github.com/sveltejs/eslint-plugin-svelte/pull/1007) [`8e9199a`](https://github.com/sveltejs/eslint-plugin-svelte/commit/8e9199ae326110778e4b0557616d394c6ac5e847) Thanks [@baseballyama](https://github.com/baseballyama)! - fix: update method for extracting major version

## 3.0.0-next.12

### Patch Changes

- [#990](https://github.com/sveltejs/eslint-plugin-svelte/pull/990) [`12049c0`](https://github.com/sveltejs/eslint-plugin-svelte/commit/12049c026f529feff6056e679ba62f07de948aa5) Thanks [@baseballyama](https://github.com/baseballyama)! - fix: ignore `css_unused_selector` compile error if `<style>` tag has `global` attribute

## 3.0.0-next.11

### Minor Changes

- [#980](https://github.com/sveltejs/eslint-plugin-svelte/pull/980) [`0b28198`](https://github.com/sveltejs/eslint-plugin-svelte/commit/0b28198edd78513e5efc4cfb45e8f1120148435e) Thanks [@baseballyama](https://github.com/baseballyama)! - feat: Implement util to conditionally run lint based on Svelte version and SvelteKit routes etc

### Patch Changes

- [#993](https://github.com/sveltejs/eslint-plugin-svelte/pull/993) [`b97a13e`](https://github.com/sveltejs/eslint-plugin-svelte/commit/b97a13eb02f9c72346f29e64734f0a304890a197) Thanks [@baseballyama](https://github.com/baseballyama)! - chore: add `:exit` for each node listener

## 3.0.0-next.10

### Patch Changes

- [#965](https://github.com/sveltejs/eslint-plugin-svelte/pull/965) [`47760ad`](https://github.com/sveltejs/eslint-plugin-svelte/commit/47760ad1b7f6b83d4c29380b3ef3cf09cde42dc8) Thanks [@marekdedic](https://github.com/marekdedic)! - chore: using svelte-eslint-parser for style selector parsing

## 3.0.0-next.9

### Minor Changes

- [#922](https://github.com/sveltejs/eslint-plugin-svelte/pull/922) [`f4a0fa7`](https://github.com/sveltejs/eslint-plugin-svelte/commit/f4a0fa78e06091348d985b5442a390eae47b0f4f) Thanks [@marekdedic](https://github.com/marekdedic)! - feat: added the no-useless-children-snippet rule

## 3.0.0-next.8

### Minor Changes

- [#844](https://github.com/sveltejs/eslint-plugin-svelte/pull/844) [`2bbd049`](https://github.com/sveltejs/eslint-plugin-svelte/commit/2bbd0497ab7e05db0aab3c8958db08e3fdf4b9b2) Thanks [@Winter](https://github.com/Winter)! - feat: Added suggestion to the `block-lang` rule.

## 3.0.0-next.7

### Major Changes

- [#900](https://github.com/sveltejs/eslint-plugin-svelte/pull/900) [`4759b47`](https://github.com/sveltejs/eslint-plugin-svelte/commit/4759b47b195abee605a0597360fc9fc4c6d95f68) Thanks [@marekdedic](https://github.com/marekdedic)! - breaking: deprecated the no-goto-without-base rule

### Minor Changes

- [#900](https://github.com/sveltejs/eslint-plugin-svelte/pull/900) [`4759b47`](https://github.com/sveltejs/eslint-plugin-svelte/commit/4759b47b195abee605a0597360fc9fc4c6d95f68) Thanks [@marekdedic](https://github.com/marekdedic)! - feat: added the no-navigation-without-base rule

## 3.0.0-next.6

### Minor Changes

- [#933](https://github.com/sveltejs/eslint-plugin-svelte/pull/933) [`71eca84`](https://github.com/sveltejs/eslint-plugin-svelte/commit/71eca843c43250591ec6fa2dd1dc547b1074d6ad) Thanks [@mikededo](https://github.com/mikededo)! - Add `prefer-const` rule

- [#963](https://github.com/sveltejs/eslint-plugin-svelte/pull/963) [`2c551b2`](https://github.com/sveltejs/eslint-plugin-svelte/commit/2c551b20557bcd53e35479336bf0c25e88a7643b) Thanks [@baseballyama](https://github.com/baseballyama)! - feat: support Svelte5 of `valid-prop-names-in-kit-pages` rule

### Patch Changes

- [#961](https://github.com/sveltejs/eslint-plugin-svelte/pull/961) [`117e60d`](https://github.com/sveltejs/eslint-plugin-svelte/commit/117e60d4290966911450c7e0db8566279e4511bb) Thanks [@baseballyama](https://github.com/baseballyama)! - fix: support each blocks without an item

## 3.0.0-next.5

### Patch Changes

- [#956](https://github.com/sveltejs/eslint-plugin-svelte/pull/956) [`157ee1f`](https://github.com/sveltejs/eslint-plugin-svelte/commit/157ee1fade79aab88f01d125b0b01cf375da4cd1) Thanks [@baseballyama](https://github.com/baseballyama)! - chore: update `svelte-eslint-parser` to v1.0.0-next.4

## 3.0.0-next.4

### Major Changes

- [#932](https://github.com/sveltejs/eslint-plugin-svelte/pull/932) [`b136ab4`](https://github.com/sveltejs/eslint-plugin-svelte/commit/b136ab4e54d8ff38f6ba7f49e1209be14dd18b0b) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat!: change the plugin to an ESM-only package

## 3.0.0-next.3

### Major Changes

- [#937](https://github.com/sveltejs/eslint-plugin-svelte/pull/937) [`729394e`](https://github.com/sveltejs/eslint-plugin-svelte/commit/729394e34d2d6f51e00c89b67a40d0f9192260b4) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat!: drop support for old eslint

### Minor Changes

- [#945](https://github.com/sveltejs/eslint-plugin-svelte/pull/945) [`19f682b`](https://github.com/sveltejs/eslint-plugin-svelte/commit/19f682b73ce6bcccae52da0e59d5ab32a9d2c3c2) Thanks [@baseballyama](https://github.com/baseballyama)! - feat: Support `<svelte:boundary>`

## 3.0.0-next.2

### Patch Changes

- [#941](https://github.com/sveltejs/eslint-plugin-svelte/pull/941) [`fce2f74`](https://github.com/sveltejs/eslint-plugin-svelte/commit/fce2f74b4b2fe8185742f0411739103301f8ea9f) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: crash with eslint v9.16.0 in `svelte/no-inner-declarations`

## 3.0.0-next.1

### Minor Changes

- [#918](https://github.com/sveltejs/eslint-plugin-svelte/pull/918) [`5da98c9`](https://github.com/sveltejs/eslint-plugin-svelte/commit/5da98c94f452c8436f26af4172e095fd91f66e1a) Thanks [@mikededo](https://github.com/mikededo)! - Added new `no-deprecated-raw-special-elements` rule

- [#836](https://github.com/sveltejs/eslint-plugin-svelte/pull/836) [`3fa90aa`](https://github.com/sveltejs/eslint-plugin-svelte/commit/3fa90aa57a15ad18105b0d80b1ed975f1f782a11) Thanks [@renovate](https://github.com/apps/renovate)! - feat: support for typescript-eslint v8 to `svelte/indent` rule

## 3.0.0-next.0

### Major Changes

- [#885](https://github.com/sveltejs/eslint-plugin-svelte/pull/885) [`ce2ffad`](https://github.com/sveltejs/eslint-plugin-svelte/commit/ce2ffad105b1c6ed2df02a9c2b84f3b654d99ad5) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat!: drop support for old node versions (<18, 19, 21)

- [#930](https://github.com/sveltejs/eslint-plugin-svelte/pull/930) [`eae1b4f`](https://github.com/sveltejs/eslint-plugin-svelte/commit/eae1b4fcbfbaec926cfa63a5d08eafcb2238bf82) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat!: upgrade svelte-eslint-parser to v1

### Minor Changes

- [#911](https://github.com/sveltejs/eslint-plugin-svelte/pull/911) [`452ffed`](https://github.com/sveltejs/eslint-plugin-svelte/commit/452ffed53791cb9e158636bcd80a221d2840cc4a) Thanks [@marekdedic](https://github.com/marekdedic)! - feat(no-inline-styles): allowing transitions by default

## 2.46.0

### Minor Changes

- [#881](https://github.com/sveltejs/eslint-plugin-svelte/pull/881) [`051925c`](https://github.com/sveltejs/eslint-plugin-svelte/commit/051925c742e1cae98cc8e7f637a6a510e472128f) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: update svelte to v5.0.0

- [#884](https://github.com/sveltejs/eslint-plugin-svelte/pull/884) [`bbc3e07`](https://github.com/sveltejs/eslint-plugin-svelte/commit/bbc3e07931da8f4aff2044a4792064200b63ab60) Thanks [@renovate](https://github.com/apps/renovate)! - fix(deps): update dependency svelte-eslint-parser to ^0.43.0

## 2.45.1

### Patch Changes

- [#874](https://github.com/sveltejs/eslint-plugin-svelte/pull/874) [`457521a`](https://github.com/sveltejs/eslint-plugin-svelte/commit/457521aef18ba95b99eb5e9c79a81d0a4fb3552e) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: update svelte-eslint-parser to v0.42

## 2.45.0

### Minor Changes

- [#870](https://github.com/sveltejs/eslint-plugin-svelte/pull/870) [`b0373be`](https://github.com/sveltejs/eslint-plugin-svelte/commit/b0373bef49e4225751c98c3c46c6099cb7d1ca72) Thanks [@mikededo](https://github.com/mikededo)! - feat(html-closing-bracket-new-line): add `html-closing-bracket-new-line` rule

- [#868](https://github.com/sveltejs/eslint-plugin-svelte/pull/868) [`edf99d3`](https://github.com/sveltejs/eslint-plugin-svelte/commit/edf99d3d7b7bf47def460efce4aabe59c2ce446d) Thanks [@mikededo](https://github.com/mikededo)! - feat(no-inspect): add `no-inspect` rule

### Patch Changes

- [#856](https://github.com/sveltejs/eslint-plugin-svelte/pull/856) [`cf6c842`](https://github.com/sveltejs/eslint-plugin-svelte/commit/cf6c842abc8730ef3841686a52273eec3906abcf) Thanks [@KuSh](https://github.com/KuSh)! - chore: Avoid using deprecated FlatConfig eslint type

## 2.44.1

### Patch Changes

- [#864](https://github.com/sveltejs/eslint-plugin-svelte/pull/864) [`580e48a`](https://github.com/sveltejs/eslint-plugin-svelte/commit/580e48ae0edcfd2cb5dd51863130a9c08b24829e) Thanks [@mikededo](https://github.com/mikededo)! - fix(svelte/indent): ensure proper snippet indent

## 2.44.0

### Minor Changes

- [#841](https://github.com/sveltejs/eslint-plugin-svelte/pull/841) [`85053a1`](https://github.com/sveltejs/eslint-plugin-svelte/commit/85053a1af237b78548a0a52f9d73ed5af695c354) Thanks [@jrmajor](https://github.com/jrmajor)! - feat: add config option for foreign elements in `svelte/html-self-closing` rule

### Patch Changes

- [#853](https://github.com/sveltejs/eslint-plugin-svelte/pull/853) [`690c04e`](https://github.com/sveltejs/eslint-plugin-svelte/commit/690c04e5ce61999cb3846881cd8bd0b571fe2874) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: update svelte-eslint-parser to 0.41.1

## 2.43.0

### Minor Changes

- [#827](https://github.com/sveltejs/eslint-plugin-svelte/pull/827) [`dc7eefc`](https://github.com/sveltejs/eslint-plugin-svelte/commit/dc7eefce962e337bb7579c8b07374931c584e65f) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix(deps): update dependency svelte-eslint-parser to ^0.41.0

## 2.42.0

### Minor Changes

- [#822](https://github.com/sveltejs/eslint-plugin-svelte/pull/822) [`88da3cf`](https://github.com/sveltejs/eslint-plugin-svelte/commit/88da3cfbfe4be364a4f6860b53fbe389264c318d) Thanks [@renovate](https://github.com/apps/renovate)! - fix(deps): update dependency svelte-eslint-parser to ^0.40.0

## 2.41.0

### Minor Changes

- [#802](https://github.com/sveltejs/eslint-plugin-svelte/pull/802) [`be64d36`](https://github.com/sveltejs/eslint-plugin-svelte/commit/be64d36dfe07f37cdd10d4bac9d80989518dccc2) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: broken indentation of if condition in `svelte/indent` rule

### Patch Changes

- [#789](https://github.com/sveltejs/eslint-plugin-svelte/pull/789) [`0bc17df`](https://github.com/sveltejs/eslint-plugin-svelte/commit/0bc17dfe72aca1236a7e693ac7e23240c8d72910) Thanks [@KuSh](https://github.com/KuSh)! - chore: Use eslint types for exported configs

- [#805](https://github.com/sveltejs/eslint-plugin-svelte/pull/805) [`6e4d3ed`](https://github.com/sveltejs/eslint-plugin-svelte/commit/6e4d3edd17cf930b3e266f51e8ae999e1961006f) Thanks [@baseballyama](https://github.com/baseballyama)! - fix: update `svelte-eslint-parser` to fix nested `{#snippet}`

- [#800](https://github.com/sveltejs/eslint-plugin-svelte/pull/800) [`580f44f`](https://github.com/sveltejs/eslint-plugin-svelte/commit/580f44fa4a64af32d7d3257b871745e926305b8c) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: add name to flat configs.

## 2.40.0

### Minor Changes

- [#792](https://github.com/sveltejs/eslint-plugin-svelte/pull/792) [`cb722bc`](https://github.com/sveltejs/eslint-plugin-svelte/commit/cb722bc9d455f4caeaa4dfdf5771dc95f06b26b8) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: update svelte-eslint-parser to 0.39

- [#796](https://github.com/sveltejs/eslint-plugin-svelte/pull/796) [`5e4d264`](https://github.com/sveltejs/eslint-plugin-svelte/commit/5e4d26495a377860f7db2ba042993fd686d41a8f) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: improve `svelte/valid-compile` to use `svelte.config.js`'s `onwarn` from the parser.

- [#794](https://github.com/sveltejs/eslint-plugin-svelte/pull/794) [`7894f82`](https://github.com/sveltejs/eslint-plugin-svelte/commit/7894f82263d114c948cfe46a041c43a93a5d9249) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: improve `svelte/valid-prop-names-in-kit-pages` to use `svelte.config.js` data from the parser.

- [#794](https://github.com/sveltejs/eslint-plugin-svelte/pull/794) [`7894f82`](https://github.com/sveltejs/eslint-plugin-svelte/commit/7894f82263d114c948cfe46a041c43a93a5d9249) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: improve `svelte/no-export-load-in-svelte-module-in-kit-pages` to use `svelte.config.js` data from the parser.

### Patch Changes

- [#795](https://github.com/sveltejs/eslint-plugin-svelte/pull/795) [`df947a7`](https://github.com/sveltejs/eslint-plugin-svelte/commit/df947a7161fe97021da37f4fcde44fe9923c0a22) Thanks [@baseballyama](https://github.com/baseballyama)! - deps: update `svelte-eslint-parser` to 0.39.1 to set `svelteFeatures.runes` to `true` by default for Svelte 5

- [#797](https://github.com/sveltejs/eslint-plugin-svelte/pull/797) [`f6d4e4c`](https://github.com/sveltejs/eslint-plugin-svelte/commit/f6d4e4c974924ef5da1a970d88f04b81a36e19b6) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: `svelte/valid-compile` to use verbatimModuleSyntax to work with TS v5.5.

## 2.39.5

### Patch Changes

- [#790](https://github.com/sveltejs/eslint-plugin-svelte/pull/790) [`f7b7649`](https://github.com/sveltejs/eslint-plugin-svelte/commit/f7b76494efbf82d3bce1b963740ef20884aa6998) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: false positives for import vars with TS in `svelte/valid-compile`

## 2.39.4

### Patch Changes

- [#786](https://github.com/sveltejs/eslint-plugin-svelte/pull/786) [`e7e25d6`](https://github.com/sveltejs/eslint-plugin-svelte/commit/e7e25d62db5050e6d16e16518a4afe67499d8efc) Thanks [@baseballyama](https://github.com/baseballyama)! - deps: update `svelte-eslint-parser` to support Svelte `5.0.0-next.155`

## 2.39.3

### Patch Changes

- [#778](https://github.com/sveltejs/eslint-plugin-svelte/pull/778) [`3e2a732`](https://github.com/sveltejs/eslint-plugin-svelte/commit/3e2a732831aae9224824bfb329ef971f135dd997) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: update svelte-eslint-parser

## 2.39.2

### Patch Changes

- [#775](https://github.com/sveltejs/eslint-plugin-svelte/pull/775) [`0e85eba`](https://github.com/sveltejs/eslint-plugin-svelte/commit/0e85ebab173759e08c1005dceda94736477ef300) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: README is not publish

## 2.39.1

### Patch Changes

- [#772](https://github.com/sveltejs/eslint-plugin-svelte/pull/772) [`0ecab95`](https://github.com/sveltejs/eslint-plugin-svelte/commit/0ecab95f74a9bd88d831671c2048a821a2194ec6) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: false positive for kebab-case with svelte v5 in `svelte/no-unused-svelte-ignore`

## 2.39.0

### Minor Changes

- [#749](https://github.com/sveltejs/eslint-plugin-svelte/pull/749) [`da4d535`](https://github.com/sveltejs/eslint-plugin-svelte/commit/da4d5357344805ef4e95aac681c2c58158199b8e) Thanks [@baseballyama](https://github.com/baseballyama)! - feat: add `svelte/no-svelte-internal` rule

- [#758](https://github.com/sveltejs/eslint-plugin-svelte/pull/758) [`6ee50c8`](https://github.com/sveltejs/eslint-plugin-svelte/commit/6ee50c8b0d8e183cf0e3c974e3b3b131007a5a30) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: Update svelte-eslint-parser to 0.36

## 2.38.0

### Minor Changes

- [#741](https://github.com/sveltejs/eslint-plugin-svelte/pull/741) [`33626a3`](https://github.com/sveltejs/eslint-plugin-svelte/commit/33626a3444cc6bd5a1789b0043ea5799b81711d1) Thanks [@baseballyama](https://github.com/baseballyama)! - Use the latest Svelte 5

## 2.37.0

### Minor Changes

- [#735](https://github.com/sveltejs/eslint-plugin-svelte/pull/735) [`33f0de2`](https://github.com/sveltejs/eslint-plugin-svelte/commit/33f0de261636e0dca77ec0479fa93a988e6ca950) Thanks [@xiBread](https://github.com/xiBread)! - feat: add rule types

## 2.36.0

### Minor Changes

- Add experimental support for Svelte v5
  - [#622](https://github.com/sveltejs/eslint-plugin-svelte/pull/622) [`470ef6c`](https://github.com/sveltejs/eslint-plugin-svelte/commit/470ef6cd1ef4767528ff15b5fbdfec1740a5ec02) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: add support for `{@snippet}`and `{@render}` in indent rule
  - [#620](https://github.com/sveltejs/eslint-plugin-svelte/pull/620) [`1097107`](https://github.com/sveltejs/eslint-plugin-svelte/commit/1097107afce00fd8b959261b015a4eb1f39f116d) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: (experimental) partial support for Svelte v5
  - [#624](https://github.com/sveltejs/eslint-plugin-svelte/pull/624) [`7df5b6f`](https://github.com/sveltejs/eslint-plugin-svelte/commit/7df5b6f0963f1fb8fc9256f8ed6f034e5f7fbf3d) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: add support for `{@snippet}` and `{@render}` in mustache-spacing rule
  - Update parser and svelte(v5)
    - [#657](https://github.com/sveltejs/eslint-plugin-svelte/pull/657) [`b159b46`](https://github.com/sveltejs/eslint-plugin-svelte/commit/b159b467427aab17c74246f9b89283aa966bb2e4) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: update svelte to v5.0.0-next.33
    - [#704](https://github.com/sveltejs/eslint-plugin-svelte/pull/704) [`af2ccf9`](https://github.com/sveltejs/eslint-plugin-svelte/commit/af2ccf9f85af00221f9ec10efbc770cba5615a62) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Update svelte-eslint-parser
    - [#693](https://github.com/sveltejs/eslint-plugin-svelte/pull/693) [`b11ff34`](https://github.com/sveltejs/eslint-plugin-svelte/commit/b11ff34de949f778d9344ec1143d1a636864d95b) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: update dependencies & some fixes
    - [#628](https://github.com/sveltejs/eslint-plugin-svelte/pull/628) [`85fc8f4`](https://github.com/sveltejs/eslint-plugin-svelte/commit/85fc8f467bd9c69475b2ef46fae7bfdd7360158f) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: update parser and fix some tests
    - [#696](https://github.com/sveltejs/eslint-plugin-svelte/pull/696) [`d4303f5`](https://github.com/sveltejs/eslint-plugin-svelte/commit/d4303f5347dae7828e08e699741a276ee35dbd43) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: update svelte-eslint-parser
    - [#635](https://github.com/sveltejs/eslint-plugin-svelte/pull/635) [`ec3f1cf`](https://github.com/sveltejs/eslint-plugin-svelte/commit/ec3f1cf5ab1726e2a8b79225c231159333474c71) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: update svelte to v5.0.0-next.16
    - [#687](https://github.com/sveltejs/eslint-plugin-svelte/pull/687) [`2943021`](https://github.com/sveltejs/eslint-plugin-svelte/commit/29430210e25cbe417ba28d65d7bf1b07ed4e08e3) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: update parser
- Support for ESLint v9
  - [#673](https://github.com/sveltejs/eslint-plugin-svelte/pull/673) [`b72b97b`](https://github.com/sveltejs/eslint-plugin-svelte/commit/b72b97ba617ff5eeb9b6f4e600c511250c19a72b) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: add support for eslint v9
  - [#708](https://github.com/sveltejs/eslint-plugin-svelte/pull/708) [`d597a69`](https://github.com/sveltejs/eslint-plugin-svelte/commit/d597a69637d95f6be13eaa10a7cc6feebd812e23) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: add support for flat config
    - [#719](https://github.com/sveltejs/eslint-plugin-svelte/pull/719) [`eaf5e6a`](https://github.com/sveltejs/eslint-plugin-svelte/commit/eaf5e6af1edab5a4d565b74be6bcc02c71c13ac6) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: suppress comment not working in flat config.
    - [#711](https://github.com/sveltejs/eslint-plugin-svelte/pull/711) [`aaba61f`](https://github.com/sveltejs/eslint-plugin-svelte/commit/aaba61f1d7f8337e690659e396d52453b3cc0002) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: flat config would cause an error with non-svelte files
- [#690](https://github.com/sveltejs/eslint-plugin-svelte/pull/690) [`e84397d`](https://github.com/sveltejs/eslint-plugin-svelte/commit/e84397dd71300fc5e4200e9e6c807a3e5f901e23) Thanks [@sdarnell](https://github.com/sdarnell)! - Added prefer option to prefer-class-directive rule ('always' or 'empty'). The default is now 'empty' which is a slight relaxation of the rule.
- [#679](https://github.com/sveltejs/eslint-plugin-svelte/pull/679) [`4e6c681`](https://github.com/sveltejs/eslint-plugin-svelte/commit/4e6c6817681b81bd546b032d7b1ff9a6a6e1935a) Thanks [@marekdedic](https://github.com/marekdedic)! - feat: added the no-goto-without-base rule

### Patch Changes

- [#694](https://github.com/sveltejs/eslint-plugin-svelte/pull/694) [`73d6fd8`](https://github.com/sveltejs/eslint-plugin-svelte/commit/73d6fd832d88af44feb9a8b86826e138d47251de) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: style report location
- [#670](https://github.com/sveltejs/eslint-plugin-svelte/pull/670) [`6121a56`](https://github.com/sveltejs/eslint-plugin-svelte/commit/6121a562f8a6d34bb338a5a2df373032abe514d6) Thanks [@renovate](https://github.com/apps/renovate)! - fix(deps): update dependency eslint-compat-utils to ^0.3.0

## 2.36.0-next.13

### Patch Changes

- [#719](https://github.com/sveltejs/eslint-plugin-svelte/pull/719) [`eaf5e6a`](https://github.com/sveltejs/eslint-plugin-svelte/commit/eaf5e6af1edab5a4d565b74be6bcc02c71c13ac6) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: suppress comment not working in flat config.

## 2.36.0-next.12

### Patch Changes

- [#711](https://github.com/sveltejs/eslint-plugin-svelte/pull/711) [`aaba61f`](https://github.com/sveltejs/eslint-plugin-svelte/commit/aaba61f1d7f8337e690659e396d52453b3cc0002) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: flat config would cause an error with non-svelte files

## 2.36.0-next.11

### Minor Changes

- [#708](https://github.com/sveltejs/eslint-plugin-svelte/pull/708) [`d597a69`](https://github.com/sveltejs/eslint-plugin-svelte/commit/d597a69637d95f6be13eaa10a7cc6feebd812e23) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: add support for flat config

## 2.36.0-next.10

### Patch Changes

- [#704](https://github.com/sveltejs/eslint-plugin-svelte/pull/704) [`af2ccf9`](https://github.com/sveltejs/eslint-plugin-svelte/commit/af2ccf9f85af00221f9ec10efbc770cba5615a62) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Update svelte-eslint-parser

## 2.36.0-next.9

### Minor Changes

- [#679](https://github.com/sveltejs/eslint-plugin-svelte/pull/679) [`4e6c681`](https://github.com/sveltejs/eslint-plugin-svelte/commit/4e6c6817681b81bd546b032d7b1ff9a6a6e1935a) Thanks [@marekdedic](https://github.com/marekdedic)! - feat: added the no-goto-without-base rule

### Patch Changes

- [#696](https://github.com/sveltejs/eslint-plugin-svelte/pull/696) [`d4303f5`](https://github.com/sveltejs/eslint-plugin-svelte/commit/d4303f5347dae7828e08e699741a276ee35dbd43) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: update svelte-eslint-parser

## 2.36.0-next.8

### Patch Changes

- [#694](https://github.com/sveltejs/eslint-plugin-svelte/pull/694) [`73d6fd8`](https://github.com/sveltejs/eslint-plugin-svelte/commit/73d6fd832d88af44feb9a8b86826e138d47251de) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: style report location

## 2.36.0-next.7

### Minor Changes

- [#690](https://github.com/sveltejs/eslint-plugin-svelte/pull/690) [`e84397d`](https://github.com/sveltejs/eslint-plugin-svelte/commit/e84397dd71300fc5e4200e9e6c807a3e5f901e23) Thanks [@sdarnell](https://github.com/sdarnell)! - Added prefer option to prefer-class-directive rule ('always' or 'empty'). The default is now 'empty' which is a slight relaxation of the rule.

### Patch Changes

- [#693](https://github.com/sveltejs/eslint-plugin-svelte/pull/693) [`b11ff34`](https://github.com/sveltejs/eslint-plugin-svelte/commit/b11ff34de949f778d9344ec1143d1a636864d95b) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: update dependencies & some fixes

## 2.36.0-next.6

### Patch Changes

- [#687](https://github.com/sveltejs/eslint-plugin-svelte/pull/687) [`2943021`](https://github.com/sveltejs/eslint-plugin-svelte/commit/29430210e25cbe417ba28d65d7bf1b07ed4e08e3) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: update parser

## 2.36.0-next.5

### Patch Changes

- [#670](https://github.com/sveltejs/eslint-plugin-svelte/pull/670) [`6121a56`](https://github.com/sveltejs/eslint-plugin-svelte/commit/6121a562f8a6d34bb338a5a2df373032abe514d6) Thanks [@renovate](https://github.com/apps/renovate)! - fix(deps): update dependency eslint-compat-utils to ^0.3.0

- [#673](https://github.com/sveltejs/eslint-plugin-svelte/pull/673) [`b72b97b`](https://github.com/sveltejs/eslint-plugin-svelte/commit/b72b97ba617ff5eeb9b6f4e600c511250c19a72b) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: add support for eslint v9

## 2.36.0-next.4

### Patch Changes

- [#657](https://github.com/sveltejs/eslint-plugin-svelte/pull/657) [`b159b46`](https://github.com/sveltejs/eslint-plugin-svelte/commit/b159b467427aab17c74246f9b89283aa966bb2e4) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: update svelte to v5.0.0-next.33

## 2.36.0-next.3

### Patch Changes

- [#635](https://github.com/sveltejs/eslint-plugin-svelte/pull/635) [`ec3f1cf`](https://github.com/sveltejs/eslint-plugin-svelte/commit/ec3f1cf5ab1726e2a8b79225c231159333474c71) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: update svelte to v5.0.0-next.16

## 2.36.0-next.2

### Patch Changes

- [#628](https://github.com/sveltejs/eslint-plugin-svelte/pull/628) [`85fc8f4`](https://github.com/sveltejs/eslint-plugin-svelte/commit/85fc8f467bd9c69475b2ef46fae7bfdd7360158f) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: update parser and fix some tests

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
