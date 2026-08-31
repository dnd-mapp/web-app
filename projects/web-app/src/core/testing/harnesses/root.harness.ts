import { ComponentHarness } from '@angular/cdk/testing';

export class RootHarness extends ComponentHarness {
    public static readonly hostSelector = 'app-root';

    private readonly titleLocator = this.locatorFor('h1');

    public async titleText(): Promise<string> {
        return await (await this.titleLocator()).text();
    }
}
