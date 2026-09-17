import { ComponentHarness } from '@angular/cdk/testing';

export class TopBarHarness extends ComponentHarness {
    public static readonly hostSelector = 'app-top-bar';

    private readonly barLocator = this.locatorFor('header');

    public async contents(): Promise<string> {
        return await (await this.barLocator()).text();
    }
}
