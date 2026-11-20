import { defaultSchema, type Options } from "rehype-sanitize";

// Bundles are fetched from whatever URL the learner pastes, so raw HTML only
// survives this allowlist. GitHub's defaults already permit <details>,
// <summary>, <a title>, table alignment and task-list checkboxes, and drop
// <script>, event handler attributes and non-http protocols.
//
// The math classes are widened on top of the `language-*` ones because
// rehype-katex runs after sanitizing and needs `math-inline`/`math-display` to
// tell inline math from a centred block.
export const markdownSchema: Options = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [["className", /^language-./, "math-inline", "math-display"]],
  },
};
