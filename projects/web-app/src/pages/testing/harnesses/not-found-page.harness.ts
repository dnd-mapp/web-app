import { ComponentHarness } from '@angular/cdk/testing';

/**
 * Drives a rendered `NotFoundPageComponent` from a spec, so the spec asserts on what a visitor sees rather than on
 * the template's structure.
 */
export class NotFoundPageHarness extends ComponentHarness {
    public static readonly hostSelector = 'app-not-found-page';

    private readonly titleLocator = this.locatorFor('h1');
    private readonly introLocator = this.locatorFor('p');
    private readonly homeLinkLocator = this.locatorFor('a');

    /**
     * Reads the page title.
     *
     * @returns The text of the level one heading.
     */
    public async titleContents(): Promise<string> {
        return await (await this.titleLocator()).text();
    }

    /**
     * Reads the line under the title that says the page does not exist.
     *
     * @returns The text of the introduction.
     */
    public async introContents(): Promise<string> {
        return await (await this.introLocator()).text();
    }

    /**
     * Reads the label of the link back to the home page.
     *
     * @returns The text of the link.
     */
    public async homeLinkContents(): Promise<string> {
        return await (await this.homeLinkLocator()).text();
    }
}
