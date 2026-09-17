import { ButtonHarness } from '@/components/testing';
import { ComponentHarness } from '@angular/cdk/testing';

/**
 * Drives a rendered `SignUpButtonComponent` from a spec. Specs of components that embed the button reach it through
 * this harness as well, with `locatorFor(SignUpButtonHarness)`, instead of querying its markup.
 */
export class SignUpButtonHarness extends ComponentHarness {
    public static readonly hostSelector = 'app-sign-up-button';

    private readonly buttonLocator = this.locatorFor(ButtonHarness);

    /**
     * Reads the label.
     *
     * @returns The text the button shows.
     */
    public async label(): Promise<string> {
        return await (await this.buttonLocator()).label();
    }
}
