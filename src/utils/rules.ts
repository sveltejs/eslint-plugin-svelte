import type { RuleModule } from "../types"
import buttonHasType from "../rules/button-has-type"
import commentDirective from "../rules/comment-directive"
import htmlQuotes from "../rules/html-quotes"
import indent from "../rules/indent"
import maxAttributesPerLine from "../rules/max-attributes-per-line"
import noAtDebugTags from "../rules/no-at-debug-tags"
import noAtHtmlTags from "../rules/no-at-html-tags"
import noDupeElseIfBlocks from "../rules/no-dupe-else-if-blocks"
import noInnerDeclarations from "../rules/no-inner-declarations"
import noObjectInTextMustaches from "../rules/no-object-in-text-mustaches"
import noTargetBlank from "../rules/no-target-blank"
import noUselessMustaches from "../rules/no-useless-mustaches"
import preferClassDirective from "../rules/prefer-class-directive"
import shorthandAttribute from "../rules/shorthand-attribute"
import spacedHtmlComment from "../rules/spaced-html-comment"
import system from "../rules/system"

export const rules = [
  buttonHasType,
  commentDirective,
  htmlQuotes,
  indent,
  maxAttributesPerLine,
  noAtDebugTags,
  noAtHtmlTags,
  noDupeElseIfBlocks,
  noInnerDeclarations,
  noObjectInTextMustaches,
  noTargetBlank,
  noUselessMustaches,
  preferClassDirective,
  shorthandAttribute,
  spacedHtmlComment,
  system,
] as RuleModule[]
