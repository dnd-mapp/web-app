import { ComponentHarness } from '@angular/cdk/testing';

/**
 * Drives a rendered `TopBarComponent` from a spec. Specs of components that embed the bar reach it through this
 * harness as well, with `locatorFor(TopBarHarness)`, instead of querying its markup.
 */
export class TopBarHarness extends ComponentHarness {
    public static readonly hostSelector = 'app-top-bar';

    private readonly barLocator = this.locatorFor('header');

    /**
     * Reads what the bar shows.
     *
     * @returns The text of the bar, an empty string while it has no contents.
     */
    public async contents(): Promise<string> {
        return await (await this.barLocator()).text();
    }
}
