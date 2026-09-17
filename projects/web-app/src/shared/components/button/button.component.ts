import { Component, computed, input } from '@angular/core';
import { type ButtonVariant, buttonVariantAttribute, buttonVariants } from './button-variant';

/**
 * A push button, applied to a native `button` element as an attribute: `<button appButton>Save</button>`. The
 * element stays what it is, so a page listens with `(click)` on it, forms and assistive technology see a real button,
 * and the component contributes the styles and a default `type="button"`, so the button never submits a form by
 * accident. Writing `type="submit"` on the element overrides that default.
 *
 * `variant` picks the button's weight: `<button appButton variant="primary">Sign up</button>` gives it the accent
 * color, which marks it as the action to take among the buttons around it. A group of them holds one at most, so the
 * emphasis stays worth something; every other button is left at the default. The input takes the attribute a
 * template wrote and `buttonVariantAttribute` turns it into a variant, so an attribute left without a value renders
 * the default button instead of an unstyled one.
 */
@Component({
    selector: 'button[appButton]',
    templateUrl: './button.component.html',
    styleUrl: './button.component.scss',
    host: {
        'type': 'button',
        '[class.primary]': 'isPrimary()',
    },
})
export class ButtonComponent {
    /** The weight the button carries, `default` unless a page marks it as the primary action. */
    public readonly variant = input<ButtonVariant, ButtonVariant | ''>(buttonVariants.default, {
        transform: buttonVariantAttribute,
    });

    /** Drives the host class the stylesheet's primary rule matches. A host expression is not type checked, so the
     * comparison lives here, where a variant that no longer exists is a compile error. */
    protected readonly isPrimary = computed(() => this.variant() === buttonVariants.primary);
}
