import { TopBarHarness } from '@/components/testing';
import { ComponentHarness } from '@angular/cdk/testing';

export class RootHarness extends ComponentHarness {
    public static readonly hostSelector = 'app-root';

    private readonly titleLocator = this.locatorFor('h1');
    private readonly topBarLocator = this.locatorForOptional(TopBarHarness);

    public async titleContents(): Promise<string> {
        return await (await this.titleLocator()).text();
    }

    public async hasTopBar(): Promise<boolean> {
        return (await this.topBarLocator()) !== null;
    }
}
