import { ComponentHarness } from '@angular/cdk/testing';
import { type ButtonVariant } from '@dnd-mapp/shared/components';
import { ButtonHarness } from '@dnd-mapp/shared/components/testing';

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

    /**
     * Reads the weight the button carries.
     *
     * @returns The variant the button renders as.
     */
    public async variant(): Promise<ButtonVariant> {
        return await (await this.buttonLocator()).variant();
    }
}
