import { Component } from '@angular/core';

/**
 * The bar across the top of every page. It renders a `header` landmark, so assistive technology announces it as the
 * banner, and has no contents yet: navigation and account controls land here as the application grows.
 */
@Component({
    selector: 'app-top-bar',
    templateUrl: './top-bar.component.html',
    styleUrl: './top-bar.component.scss',
})
export class TopBarComponent {}
