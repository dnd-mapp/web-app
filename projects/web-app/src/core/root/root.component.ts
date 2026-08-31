import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

interface Item {
    title: string;
    link: string;
}

@Component({
    selector: 'app-root',
    templateUrl: './root.component.html',
    imports: [RouterOutlet],
})
export class RootComponent {
    protected readonly title = signal('web-app');

    protected readonly items = signal<Item[]>([
        { title: 'Explore the Docs', link: 'https://angular.dev' },
        { title: 'Learn with Tutorials', link: 'https://angular.dev/tutorials' },
        { title: 'Prompt and best practices for AI', link: 'https://angular.dev/ai/develop-with-ai' },
        { title: 'CLI Docs', link: 'https://angular.dev/tools/cli' },
        { title: 'Angular Language Service', link: 'https://angular.dev/tools/language-service' },
        { title: 'Angular DevTools', link: 'https://angular.dev/tools/devtools' },
    ]);
}
