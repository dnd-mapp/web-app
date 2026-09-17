import { TopBarComponent } from '@/components';
import { Component } from '@angular/core';

/**
 * The application shell that `main.ts` bootstraps: the top bar above a `main` region that fills the rest with the
 * viewport. Pages render inside that region, so the surrounding shell is defined here once.
 */
@Component({
    selector: 'app-root',
    templateUrl: './root.component.html',
    styleUrl: './root.component.scss',
    imports: [TopBarComponent],
})
export class RootComponent {}
