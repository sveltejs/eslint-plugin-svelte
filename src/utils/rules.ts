import type { RuleModule } from "../types"
import typescriptEslintNoUnnecessaryCondition from "../rules/@typescript-eslint/no-unnecessary-condition"
import buttonHasType from "../rules/button-has-type"
import commentDirective from "../rules/comment-directive"
import derivedHasSameInputsOutputs from "../rules/derived-has-same-inputs-outputs"
import experimentalRequireSlotTypes from "../rules/experimental-require-slot-types"
import experimentalRequireStrictEvents from "../rules/experimental-require-strict-events"
import firstAttributeLinebreak from "../rules/first-attribute-linebreak"
import htmlClosingBracketSpacing from "../rules/html-closing-bracket-spacing"
import htmlQuotes from "../rules/html-quotes"
import htmlSelfClosing from "../rules/html-self-closing"
import indent from "../rules/indent"
import infiniteReactiveLoop from "../rules/infinite-reactive-loop"
import maxAttributesPerLine from "../rules/max-attributes-per-line"
import mustacheSpacing from "../rules/mustache-spacing"
import noAtDebugTags from "../rules/no-at-debug-tags"
import noAtHtmlTags from "../rules/no-at-html-tags"
import noDomManipulating from "../rules/no-dom-manipulating"
import noDupeElseIfBlocks from "../rules/no-dupe-else-if-blocks"
import noDupeOnDirectives from "../rules/no-dupe-on-directives"
import noDupeStyleProperties from "../rules/no-dupe-style-properties"
import noDupeUseDirectives from "../rules/no-dupe-use-directives"
import noDynamicSlotName from "../rules/no-dynamic-slot-name"
import noExportLoadInSvelteModuleInKitPages from "../rules/no-export-load-in-svelte-module-in-kit-pages"
import noExtraReactiveCurlies from "../rules/no-extra-reactive-curlies"
import noInnerDeclarations from "../rules/no-inner-declarations"
import noNotFunctionHandler from "../rules/no-not-function-handler"
import noObjectInTextMustaches from "../rules/no-object-in-text-mustaches"
import noReactiveFunctions from "../rules/no-reactive-functions"
import noReactiveLiterals from "../rules/no-reactive-literals"
import noShorthandStylePropertyOverrides from "../rules/no-shorthand-style-property-overrides"
import noSpacesAroundEqualSignsInAttribute from "../rules/no-spaces-around-equal-signs-in-attribute"
import noStoreAsync from "../rules/no-store-async"
import noTargetBlank from "../rules/no-target-blank"
import noTrailingSpaces from "../rules/no-trailing-spaces"
import noUnknownStyleDirectiveProperty from "../rules/no-unknown-style-directive-property"
import noUnusedSvelteIgnore from "../rules/no-unused-svelte-ignore"
import noUselessMustaches from "../rules/no-useless-mustaches"
import preferClassDirective from "../rules/prefer-class-directive"
import preferDestructuredStoreProps from "../rules/prefer-destructured-store-props"
import preferStyleDirective from "../rules/prefer-style-directive"
import requireEventDispatcherTypes from "../rules/require-event-dispatcher-types"
import requireOptimizedStyleAttribute from "../rules/require-optimized-style-attribute"
import requireStoreCallbacksUseSetParam from "../rules/require-store-callbacks-use-set-param"
import requireStoreReactiveAccess from "../rules/require-store-reactive-access"
import requireStoresInit from "../rules/require-stores-init"
import shorthandAttribute from "../rules/shorthand-attribute"
import shorthandDirective from "../rules/shorthand-directive"
import sortAttributes from "../rules/sort-attributes"
import spacedHtmlComment from "../rules/spaced-html-comment"
import system from "../rules/system"
import validCompile from "../rules/valid-compile"
import validPropNamesInKitPages from "../rules/valid-prop-names-in-kit-pages"

export const rules = [
  typescriptEslintNoUnnecessaryCondition,
  buttonHasType,
  commentDirective,
  derivedHasSameInputsOutputs,
  experimentalRequireSlotTypes,
  experimentalRequireStrictEvents,
  firstAttributeLinebreak,
  htmlClosingBracketSpacing,
  htmlQuotes,
  htmlSelfClosing,
  indent,
  infiniteReactiveLoop,
  maxAttributesPerLine,
  mustacheSpacing,
  noAtDebugTags,
  noAtHtmlTags,
  noDomManipulating,
  noDupeElseIfBlocks,
  noDupeOnDirectives,
  noDupeStyleProperties,
  noDupeUseDirectives,
  noDynamicSlotName,
  noExportLoadInSvelteModuleInKitPages,
  noExtraReactiveCurlies,
  noInnerDeclarations,
  noNotFunctionHandler,
  noObjectInTextMustaches,
  noReactiveFunctions,
  noReactiveLiterals,
  noShorthandStylePropertyOverrides,
  noSpacesAroundEqualSignsInAttribute,
  noStoreAsync,
  noTargetBlank,
  noTrailingSpaces,
  noUnknownStyleDirectiveProperty,
  noUnusedSvelteIgnore,
  noUselessMustaches,
  preferClassDirective,
  preferDestructuredStoreProps,
  preferStyleDirective,
  requireEventDispatcherTypes,
  requireOptimizedStyleAttribute,
  requireStoreCallbacksUseSetParam,
  requireStoreReactiveAccess,
  requireStoresInit,
  shorthandAttribute,
  shorthandDirective,
  sortAttributes,
  spacedHtmlComment,
  system,
  validCompile,
  validPropNamesInKitPages,
] as RuleModule[]
