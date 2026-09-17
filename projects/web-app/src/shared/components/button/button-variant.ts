/**
 * The weights a button can carry, under the value a template writes: `primary` for the one action a page leads
 * with, `default` for every other. This object is the one list of them, so a further variant is an entry here that
 * the type below and `toButtonVariant` pick up without a change of their own.
 */
export const buttonVariants = {
    default: 'default',
    primary: 'primary',
} as const;

/** The weight a button carries, one of the values `buttonVariants` holds. */
export type ButtonVariant = (typeof buttonVariants)[keyof typeof buttonVariants];

/**
 * Reads the variant out of what a template passed. An attribute hands over a plain string and a binding hands over
 * whatever the page had, so a value that names no variant, from a typo or from data, falls back to the default
 * rather than leaving the button with a weight nothing styles.
 *
 * @param value Whatever the template gave the `variant` input.
 * @returns The variant the value names, or `buttonVariants.default` when it names none.
 */
export function toButtonVariant(value: unknown): ButtonVariant {
    return Object.values(buttonVariants).find((variant) => variant === value) ?? buttonVariants.default;
}
