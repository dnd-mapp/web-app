import { ComponentHarness } from '@angular/cdk/testing';

/**
 * Drives a rendered `HomePageComponent` from a spec, so the spec asserts on what a visitor sees rather than on the
 * template's structure.
 */
export class HomePageHarness extends ComponentHarness {
    public static readonly hostSelector = 'app-home-page';

    private readonly titleLocator = this.locatorFor('h1');
    private readonly introLocator = this.locatorFor('p');

    /**
     * Reads the page title.
     *
     * @returns The text of the level one heading.
     */
    public async titleContents(): Promise<string> {
        return await (await this.titleLocator()).text();
    }

    /**
     * Reads the line under the title that says what the application does.
     *
     * @returns The text of the introduction.
     */
    public async introContents(): Promise<string> {
        return await (await this.introLocator()).text();
    }
}
