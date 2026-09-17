/**
 * The weights a button can carry, under the value a template writes: `primary` for the one action a page leads
 * with, `default` for every other. This object is the one list of them, so a further variant is an entry here that
 * the type below and `buttonVariantAttribute` pick up without a change of their own.
 */
export const buttonVariants = {
    default: 'default',
    primary: 'primary',
} as const;

/** The weight a button carries, one of the values `buttonVariants` holds. */
export type ButtonVariant = (typeof buttonVariants)[keyof typeof buttonVariants];

/**
 * Reads the variant out of the attribute a template wrote, the way `booleanAttribute` and `numberAttribute` read
 * theirs. A template writes a variant or leaves the attribute without a value, `<button appButton variant>`, which
 * arrives as an empty string; either way what comes out is a variant, so a button whose attribute named none
 * renders the default rather than carrying a weight no rule styles.
 *
 * @param value The attribute a template wrote: a variant, or an empty string when it carried no value.
 * @returns The variant the value names, or `buttonVariants.default` when it names none.
 */
export function buttonVariantAttribute(value: ButtonVariant | ''): ButtonVariant {
    return Object.values(buttonVariants).find((variant) => variant === value) ?? buttonVariants.default;
}
