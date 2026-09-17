import { ComponentHarness } from '@angular/cdk/testing';
import { ShellTopBarHarness } from './shell-top-bar.harness';

/**
 * Drives a rendered `RootComponent` from a spec, so the spec asserts on what a user sees rather than on the
 * template's structure. What a page renders belongs to that page, so its own harness is where its content is read.
 */
export class RootHarness extends ComponentHarness {
    public static readonly hostSelector = 'app-root';

    private readonly pageOutletLocator = this.locatorForOptional('main router-outlet');
    private readonly topBarLocator = this.locatorForOptional(ShellTopBarHarness);

    /**
     * Checks whether the shell gives the router a region to render the current page in.
     *
     * @returns `true` when the main region holds an outlet, `false` when it does not.
     */
    public async hasPageOutlet(): Promise<boolean> {
        return (await this.pageOutletLocator()) !== null;
    }

    /**
     * Checks whether the shell renders the top bar.
     *
     * @returns `true` when a top bar is present, `false` when it is not.
     */
    public async hasTopBar(): Promise<boolean> {
        return (await this.topBarLocator()) !== null;
    }
}
