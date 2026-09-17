import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ShellTopBarComponent } from '../shell-top-bar/shell-top-bar.component';

/**
 * The application shell that `main.ts` bootstraps: the top bar above a `main` region that fills the rest with the
 * viewport. The router renders the page of the current route into that region, so the surrounding shell is defined
 * here once and a page contributes its own content alone.
 */
@Component({
    selector: 'app-root',
    templateUrl: './root.component.html',
    styleUrl: './root.component.scss',
    imports: [RouterOutlet, ShellTopBarComponent],
})
export class RootComponent {}
