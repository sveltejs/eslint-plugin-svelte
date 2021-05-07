import type { RuleModule } from "../types"
import buttonHasType from "../rules/button-has-type"
import noAtDebugTags from "../rules/no-at-debug-tags"
import noAtHtmlTags from "../rules/no-at-html-tags"
import noDupeElseIfBlocks from "../rules/no-dupe-else-if-blocks"
import noInnerDeclarations from "../rules/no-inner-declarations"
import noTargetBlank from "../rules/no-target-blank"
import noUselessMustaches from "../rules/no-useless-mustaches"
import preferClassDirective from "../rules/prefer-class-directive"
import spacedHtmlComment from "../rules/spaced-html-comment"

export const rules = [
  buttonHasType,
  noAtDebugTags,
  noAtHtmlTags,
  noDupeElseIfBlocks,
  noInnerDeclarations,
  noTargetBlank,
  noUselessMustaches,
  preferClassDirective,
  spacedHtmlComment,
] as RuleModule[]
