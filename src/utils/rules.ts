import type { RuleModule } from "../types"
import noAtHtmlTags from "../rules/no-at-html-tags"
import spacedHtmlComment from "../rules/spaced-html-comment"

export const rules = [noAtHtmlTags, spacedHtmlComment] as RuleModule[]
