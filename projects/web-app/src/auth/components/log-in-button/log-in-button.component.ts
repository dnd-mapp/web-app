import { Component } from '@angular/core';
import { ButtonComponent } from '@dnd-mapp/shared/components';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * The button that takes a visitor to the page where they log in. It owns the label and, once that page exists, the
 * step that opens it, so every bar or page offering to log in renders the same button rather than repeating both.
 * The page lives in a separate application that does not exist yet, so the button does nothing until it does.
 */
@Component({
    selector: 'app-log-in-button',
    templateUrl: './log-in-button.component.html',
    imports: [ButtonComponent, TranslatePipe],
})
export class LogInButtonComponent {}
