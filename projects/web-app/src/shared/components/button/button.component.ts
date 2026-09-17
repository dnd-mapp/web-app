import { Component } from '@angular/core';

/**
 * A push button, applied to a native `button` element as an attribute: `<button appButton>Save</button>`. The
 * element stays what it is, so a page listens with `(click)` on it, forms and assistive technology see a real button,
 * and the component contributes the styles and a default `type="button"`, so the button never submits a form by
 * accident. Writing `type="submit"` on the element overrides that default.
 */
@Component({
    selector: 'button[appButton]',
    templateUrl: './button.component.html',
    styleUrl: './button.component.scss',
    host: {
        type: 'button',
    },
})
export class ButtonComponent {}
