import { ComponentHarness } from '@angular/cdk/testing';

/**
 * Drives a rendered `TopBarComponent` from a spec. Specs of components that embed the bar reach it through this
 * harness as well, with `locatorFor(TopBarHarness)`, instead of querying its markup. What a slot holds belongs to
 * the component that filled it, so that component's harness is where its content is read.
 */
export class TopBarHarness extends ComponentHarness {
    public static readonly hostSelector = 'app-top-bar';

    private readonly actionsLocator = this.locatorFor('.actions');

    /**
     * Reads what the bar renders in its `actions` slot.
     *
     * @returns The text of the content the slot was given.
     */
    public async actionContents(): Promise<string> {
        return await (await this.actionsLocator()).text();
    }
}
