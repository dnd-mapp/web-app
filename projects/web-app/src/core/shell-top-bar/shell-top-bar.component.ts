import { LogInButtonComponent, SignUpButtonComponent } from '@/auth/components';
import { BrandComponent, TopBarComponent } from '@/components';
import { Component } from '@angular/core';

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
export class ShellTopBarComponent {}
