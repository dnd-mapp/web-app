# Design system

## Tokens

The design system lives under [projects/web-app/src/design-system](../projects/web-app/src/design-system) and, for now, consists of design tokens: named CSS custom properties that hold every color and typography value the application uses. They are declared on `:root` in two layers, one SCSS partial each under `tokens/`, and the folder's `_index.scss` loads both. [styles.scss](../projects/web-app/src/styles.scss) loads that index once with `@use`, so the custom properties exist on every page and a component stylesheet reads them with `var()` without importing anything.

### Primitive tokens

[\_primitive.scss](../projects/web-app/src/design-system/tokens/_primitive.scss) holds the raw values, named after what they are rather than where they are used: `--color-gray-100`, `--font-family-sans`, `--font-size-100`. Colors are written in `oklch()` and numbered from light (`100`) to dark (`900`); the typography scales use `100` for the base step, so a larger step gets a higher number and a smaller one a lower number. Nothing outside the semantic layer references a primitive directly.

### Semantic tokens

[\_semantic.scss](../projects/web-app/src/design-system/tokens/_semantic.scss) names each value after its purpose in the interface and maps it onto a primitive: `--color-text` and `--color-background` for color, and `--text-body-family`, `--text-body-size` and `--text-body-line-height` for body text. These are the tokens that global and component styles reference. The file also sets `color-scheme: dark`, since the mapping it holds is the dark theme; a second theme would remap the same semantic names onto other primitives.

### Adding a token

A token is added when a style needs the value, not ahead of it: the set of tokens describes what the application uses today, so an unused token is removed rather than kept for later. To add one, put the raw value in the primitive layer under a name that describes the value, add a semantic token that names the purpose and points at the primitive, and reference the semantic token from the style. When a value already exists as a primitive, only the semantic token is new. [Stylelint](linting.md#styles) checks the partials along with the rest of the SCSS.
