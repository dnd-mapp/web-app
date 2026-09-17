import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ShellTopBarComponent } from '../shell-top-bar/shell-top-bar.component';

/**
 * The application shell that `main.ts` bootstraps: the top bar above a `main` region that fills the rest with the
 * viewport. Pages render inside that region, so the surrounding shell is defined here once.
 */
@Component({
    selector: 'app-root',
    templateUrl: './root.component.html',
    styleUrl: './root.component.scss',
    imports: [ShellTopBarComponent, TranslatePipe],
})
export class RootComponent {}
