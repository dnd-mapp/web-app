import { Component } from '@angular/core';
import { ButtonComponent } from '@dnd-mapp/shared/components';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * The button that takes a visitor to the page where they sign up. It owns the label and, once that page exists, the
 * step that opens it, so every bar or page offering to sign up renders the same button rather than repeating both.
 * The page lives in a separate application that does not exist yet, so the button does nothing until it does.
 *
 * It renders as the primary button, since signing up is what a visitor without an account is here to do, and so the
 * one action it is worth leading with next to logging in.
 */
@Component({
    selector: 'app-sign-up-button',
    templateUrl: './sign-up-button.component.html',
    imports: [ButtonComponent, TranslatePipe],
})
export class SignUpButtonComponent {}
