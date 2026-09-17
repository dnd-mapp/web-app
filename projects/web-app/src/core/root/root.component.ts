import { TopBarComponent } from '@/components';
import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './root.component.html',
    styleUrl: './root.component.scss',
    imports: [TopBarComponent],
})
export class RootComponent {}
