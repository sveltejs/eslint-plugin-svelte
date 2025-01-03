// IMPORTANT!
// This file has been automatically generated,
// in order to update its content execute "pnpm run update"
import type { RuleModule } from '../types.js';
import typescriptEslintNoUnnecessaryCondition from '../rules/@typescript-eslint/no-unnecessary-condition.js';
import blockLang from '../rules/block-lang.js';
import buttonHasType from '../rules/button-has-type.js';
import commentDirective from '../rules/comment-directive.js';
import derivedHasSameInputsOutputs from '../rules/derived-has-same-inputs-outputs.js';
import experimentalRequireSlotTypes from '../rules/experimental-require-slot-types.js';
import experimentalRequireStrictEvents from '../rules/experimental-require-strict-events.js';
import firstAttributeLinebreak from '../rules/first-attribute-linebreak.js';
import htmlClosingBracketNewLine from '../rules/html-closing-bracket-new-line.js';
import htmlClosingBracketSpacing from '../rules/html-closing-bracket-spacing.js';
import htmlQuotes from '../rules/html-quotes.js';
import htmlSelfClosing from '../rules/html-self-closing.js';
import indent from '../rules/indent.js';
import infiniteReactiveLoop from '../rules/infinite-reactive-loop.js';
import maxAttributesPerLine from '../rules/max-attributes-per-line.js';
import mustacheSpacing from '../rules/mustache-spacing.js';
import noAtDebugTags from '../rules/no-at-debug-tags.js';
import noAtHtmlTags from '../rules/no-at-html-tags.js';
import noDeprecatedRawSpecialElements from '../rules/no-deprecated-raw-special-elements.js';
import noDomManipulating from '../rules/no-dom-manipulating.js';
import noDupeElseIfBlocks from '../rules/no-dupe-else-if-blocks.js';
import noDupeOnDirectives from '../rules/no-dupe-on-directives.js';
import noDupeStyleProperties from '../rules/no-dupe-style-properties.js';
import noDupeUseDirectives from '../rules/no-dupe-use-directives.js';
import noDynamicSlotName from '../rules/no-dynamic-slot-name.js';
import noExportLoadInSvelteModuleInKitPages from '../rules/no-export-load-in-svelte-module-in-kit-pages.js';
import noExtraReactiveCurlies from '../rules/no-extra-reactive-curlies.js';
import noGotoWithoutBase from '../rules/no-goto-without-base.js';
import noIgnoredUnsubscribe from '../rules/no-ignored-unsubscribe.js';
import noImmutableReactiveStatements from '../rules/no-immutable-reactive-statements.js';
import noInlineStyles from '../rules/no-inline-styles.js';
import noInnerDeclarations from '../rules/no-inner-declarations.js';
import noInspect from '../rules/no-inspect.js';
import noNavigationWithoutBase from '../rules/no-navigation-without-base.js';
import noNotFunctionHandler from '../rules/no-not-function-handler.js';
import noObjectInTextMustaches from '../rules/no-object-in-text-mustaches.js';
import noReactiveFunctions from '../rules/no-reactive-functions.js';
import noReactiveLiterals from '../rules/no-reactive-literals.js';
import noReactiveReassign from '../rules/no-reactive-reassign.js';
import noRestrictedHtmlElements from '../rules/no-restricted-html-elements.js';
import noShorthandStylePropertyOverrides from '../rules/no-shorthand-style-property-overrides.js';
import noSpacesAroundEqualSignsInAttribute from '../rules/no-spaces-around-equal-signs-in-attribute.js';
import noStoreAsync from '../rules/no-store-async.js';
import noSvelteInternal from '../rules/no-svelte-internal.js';
import noTargetBlank from '../rules/no-target-blank.js';
import noTrailingSpaces from '../rules/no-trailing-spaces.js';
import noUnknownStyleDirectiveProperty from '../rules/no-unknown-style-directive-property.js';
import noUnusedClassName from '../rules/no-unused-class-name.js';
import noUnusedSvelteIgnore from '../rules/no-unused-svelte-ignore.js';
import noUselessChildrenSnippet from '../rules/no-useless-children-snippet.js';
import noUselessMustaches from '../rules/no-useless-mustaches.js';
import preferClassDirective from '../rules/prefer-class-directive.js';
import preferConst from '../rules/prefer-const.js';
import preferDestructuredStoreProps from '../rules/prefer-destructured-store-props.js';
import preferStyleDirective from '../rules/prefer-style-directive.js';
import requireEachKey from '../rules/require-each-key.js';
import requireEventDispatcherTypes from '../rules/require-event-dispatcher-types.js';
import requireOptimizedStyleAttribute from '../rules/require-optimized-style-attribute.js';
import requireStoreCallbacksUseSetParam from '../rules/require-store-callbacks-use-set-param.js';
import requireStoreReactiveAccess from '../rules/require-store-reactive-access.js';
import requireStoresInit from '../rules/require-stores-init.js';
import requireTargetBlankExternalLink from '../rules/require-target-blank-external-link.js';
import shorthandAttribute from '../rules/shorthand-attribute.js';
import shorthandDirective from '../rules/shorthand-directive.js';
import sortAttributes from '../rules/sort-attributes.js';
import spacedHtmlComment from '../rules/spaced-html-comment.js';
import system from '../rules/system.js';
import validCompile from '../rules/valid-compile.js';
import validEachKey from '../rules/valid-each-key.js';
import validPropNamesInKitPages from '../rules/valid-prop-names-in-kit-pages.js';

export const rules = [
	typescriptEslintNoUnnecessaryCondition,
	blockLang,
	buttonHasType,
	commentDirective,
	derivedHasSameInputsOutputs,
	experimentalRequireSlotTypes,
	experimentalRequireStrictEvents,
	firstAttributeLinebreak,
	htmlClosingBracketNewLine,
	htmlClosingBracketSpacing,
	htmlQuotes,
	htmlSelfClosing,
	indent,
	infiniteReactiveLoop,
	maxAttributesPerLine,
	mustacheSpacing,
	noAtDebugTags,
	noAtHtmlTags,
	noDeprecatedRawSpecialElements,
	noDomManipulating,
	noDupeElseIfBlocks,
	noDupeOnDirectives,
	noDupeStyleProperties,
	noDupeUseDirectives,
	noDynamicSlotName,
	noExportLoadInSvelteModuleInKitPages,
	noExtraReactiveCurlies,
	noGotoWithoutBase,
	noIgnoredUnsubscribe,
	noImmutableReactiveStatements,
	noInlineStyles,
	noInnerDeclarations,
	noInspect,
	noNavigationWithoutBase,
	noNotFunctionHandler,
	noObjectInTextMustaches,
	noReactiveFunctions,
	noReactiveLiterals,
	noReactiveReassign,
	noRestrictedHtmlElements,
	noShorthandStylePropertyOverrides,
	noSpacesAroundEqualSignsInAttribute,
	noStoreAsync,
	noSvelteInternal,
	noTargetBlank,
	noTrailingSpaces,
	noUnknownStyleDirectiveProperty,
	noUnusedClassName,
	noUnusedSvelteIgnore,
	noUselessChildrenSnippet,
	noUselessMustaches,
	preferClassDirective,
	preferConst,
	preferDestructuredStoreProps,
	preferStyleDirective,
	requireEachKey,
	requireEventDispatcherTypes,
	requireOptimizedStyleAttribute,
	requireStoreCallbacksUseSetParam,
	requireStoreReactiveAccess,
	requireStoresInit,
	requireTargetBlankExternalLink,
	shorthandAttribute,
	shorthandDirective,
	sortAttributes,
	spacedHtmlComment,
	system,
	validCompile,
	validEachKey,
	validPropNamesInKitPages
] as RuleModule[];
