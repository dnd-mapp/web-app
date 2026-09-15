# Agent guidelines

## Writing style

Applies to every piece of prose you produce: documentation, commit messages, pull request descriptions, code comments, and chat responses.

Write US English. Instead of an em dash, use the punctuation that fits the clause:

- Commas for short interruptions or clauses.
- Parentheses for asides.
- Colons for explanations, examples, or summaries.
- Semicolons to connect closely related independent clauses.
- Periods to split long sentences.

Rewrite the sentence when none of these fit, rather than falling back on double hyphens.

### Final reading pass

Read the finished text once more before handing it over, and fix what you find:

- **Sentence length.** Split every sentence of 40 words or more. Quotes from external sources stay verbatim.
- **Spelling.** Convert British spellings to US ones: `behaviour` to `behavior`, `initialise` to `initialize`, `colour` to `color`.
- **Em dashes.** Replace every `—` with an alternative from the list above.

The pass is done when all three checks have run over the whole text, not only the parts edited last.

### Markdown

Let prose flow: write each paragraph as one line and leave wrapping to the renderer.

Give every table an alignment indicator in its separator row:

| Setting | Scope  | Default |
|:--------|:------:|--------:|
| `theme` | global |    dark |
