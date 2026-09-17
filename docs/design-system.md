# Design system

## Tokens

The design system lives under [projects/web-app/src/design-system](../projects/web-app/src/design-system) and, for now, consists of design tokens: named CSS custom properties that hold every color and typography value the application uses. They are declared on `:root` in two layers, one SCSS partial each under `tokens/`, and the folder's `_index.scss` loads both. [styles.scss](../projects/web-app/src/styles.scss) loads that index once with `@use`, so the custom properties exist on every page and a component stylesheet reads them with `var()` without importing anything.

### Primitive tokens

[\_primitive.scss](../projects/web-app/src/design-system/tokens/_primitive.scss) holds the raw values, named after what they are rather than where they are used: `--color-gray-500`, `--font-family-sans`, `--font-size-100`. Each color is a complete eleven step scale written in `oklch()`, numbered `50`, `100`, `200` through `900`, `950` from light to dark, with the lightness falling in even steps and the chroma deepening slightly toward the dark end. The font size scale has eight steps in `rem`, numbered `50`, `75`, `100`, `200` through `600`, with `100` as the body size: the two steps below it serve captions and compact controls, the steps above it serve headings. Line height is a unitless ratio and uses the same numbering, with `100` as the body value. Nothing outside the semantic layer references a primitive directly.

### Semantic tokens

[\_semantic.scss](../projects/web-app/src/design-system/tokens/_semantic.scss) names each value after its purpose in the interface and maps it onto a primitive: `--color-text` and `--color-background` for color, and `--text-body-family`, `--text-body-size` and `--text-body-line-height` for body text. These are the tokens that global and component styles reference. The file also sets `color-scheme: dark`, since the mapping it holds is the dark theme; a second theme would remap the same semantic names onto other primitives.

### Adding a token

A scale enters the primitive layer whole: all eleven steps of a color, all eight of a font size. Its steps only make sense relative to each other, and a semantic token then picks from a fixed set rather than introducing a value of its own. Every other token is added when a style needs the value, not ahead of it: line heights, font families and the semantic tokens describe what the application uses today, so an unused one is removed rather than kept for later. To add one, put the raw value in the primitive layer under a name that describes the value, add a semantic token that names the purpose and points at the primitive, and reference the semantic token from the style. When a value already exists as a primitive, only the semantic token is new. [Stylelint](linting.md#styles) checks the partials along with the rest of the SCSS.
