import { Component, input } from '@angular/core';

/** How much weight a button carries: `primary` for the one action a page leads with, `default` for every other. */
export type ButtonVariant = 'default' | 'primary';

/**
 * A push button, applied to a native `button` element as an attribute: `<button appButton>Save</button>`. The
 * element stays what it is, so a page listens with `(click)` on it, forms and assistive technology see a real button,
 * and the component contributes the styles and a default `type="button"`, so the button never submits a form by
 * accident. Writing `type="submit"` on the element overrides that default.
 *
 * `variant` picks the button's weight: `<button appButton variant="primary">Sign up</button>` gives it the accent
 * color, which marks it as the action to take among the buttons around it. A group of them holds one at most, so the
 * emphasis stays worth something; every other button is left at the default.
 */
@Component({
    selector: 'button[appButton]',
    templateUrl: './button.component.html',
    styleUrl: './button.component.scss',
    host: {
        'type': 'button',
        '[class.primary]': "variant() === 'primary'",
    },
})
export class ButtonComponent {
    /** The weight the button carries, `default` unless a page marks it as the primary action. */
    public readonly variant = input<ButtonVariant>('default');
}
