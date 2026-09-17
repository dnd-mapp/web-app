import { TopBarHarness } from '@/components/testing';
import { ComponentHarness } from '@angular/cdk/testing';

/**
 * Drives a rendered `RootComponent` from a spec, so the spec asserts on what a user sees rather than on the
 * template's structure.
 */
export class RootHarness extends ComponentHarness {
    public static readonly hostSelector = 'app-root';

    private readonly titleLocator = this.locatorFor('h1');
    private readonly topBarLocator = this.locatorForOptional(TopBarHarness);

    /**
     * Reads the page title.
     *
     * @returns The text of the level one heading.
     */
    public async titleContents(): Promise<string> {
        return await (await this.titleLocator()).text();
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
