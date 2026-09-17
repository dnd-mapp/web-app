import { Component } from '@angular/core';

/**
 * The bar across the top of every page. It renders a `header` landmark, so assistive technology announces it as the
 * banner, and holds one slot: `actions`, a row at the end of the bar for the controls a page offers. Content picks
 * its slot with `ngProjectAs`, naming the slot as an attribute selector, and content carrying none is not rendered.
 *
 * ```html
 * <app-top-bar>
 *     <ng-container ngProjectAs="[actions]">
 *         <app-log-in-button />
 *         <app-sign-up-button />
 *     </ng-container>
 * </app-top-bar>
 * ```
 *
 * An `ng-container` marks everything it holds at once and renders no element of its own, so each of its children
 * still lands in the slot as a child of the slot's own `div` and the layout below reaches them.
 *
 * The bar owns the chrome alone, its height, its surface, its border and the way each slot lays its content out, and
 * knows nothing about what that content is, so every application that renders one projects its own.
 * `ShellTopBarComponent` under `core` is what this application projects into it. A further slot is a further `div`
 * in the template with its own `ng-content` and its own styles here.
 */
@Component({
    selector: 'app-top-bar',
    templateUrl: './top-bar.component.html',
    styleUrl: './top-bar.component.scss',
})
export class TopBarComponent {}
