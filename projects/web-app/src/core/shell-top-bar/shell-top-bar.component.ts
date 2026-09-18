import { Component } from '@angular/core';
import { LogInButtonComponent, SignUpButtonComponent } from '@dnd-mapp/web-auth/components';
import { BrandComponent, TopBarComponent } from '@dnd-mapp/web-ui/components';

/**
 * This application's top bar: the shared bar with the wordmark at its start and the account actions in it, a button
 * to log in and one to sign up. `RootComponent` renders it, and anything the bar comes to hold is added here, so the
 * shared bar stays free of what any one application puts in it. The bar itself lays its slots out, so this component
 * contributes no styles.
 */
@Component({
    selector: 'app-shell-top-bar',
    templateUrl: './shell-top-bar.component.html',
    imports: [BrandComponent, LogInButtonComponent, SignUpButtonComponent, TopBarComponent],
})
export class ShellTopBarComponent {
    /**
     * The name this application goes by, which the wordmark in the bar writes out. The shared wordmark takes it as
     * an input, since the name belongs to this application rather than to the component that renders it, so this is
     * where the name is spelled out for the interface; `index.html` spells it out again for the browser's title bar,
     * which no Angular template reaches.
     */
    public readonly applicationName = 'D&D Mapp';
}
