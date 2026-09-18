import { ComponentHarness } from '@angular/cdk/testing';

/**
 * Drives a rendered `BrandComponent` from a spec. Specs of components that embed the wordmark reach it through this
 * harness as well, with `locatorFor(BrandHarness)`, instead of querying its markup.
 */
export class BrandHarness extends ComponentHarness {
    public static readonly hostSelector = 'app-brand';

    private readonly linkLocator = this.locatorFor('a');

    /**
     * Reads the name the wordmark writes out.
     *
     * @returns The text the wordmark shows.
     */
    public async name(): Promise<string> {
        return await (await this.host()).text();
    }

    /**
     * Reads where the wordmark leads.
     *
     * @returns The path the link navigates to, or `null` when it carries none.
     */
    public async destination(): Promise<string | null> {
        return await (await this.linkLocator()).getAttribute('href');
    }
}
