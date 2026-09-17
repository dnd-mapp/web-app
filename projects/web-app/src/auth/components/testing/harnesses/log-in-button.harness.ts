import { type ButtonVariant } from '@/components';
import { ButtonHarness } from '@/components/testing';
import { ComponentHarness } from '@angular/cdk/testing';

/**
 * Drives a rendered `LogInButtonComponent` from a spec. Specs of components that embed the button reach it through
 * this harness as well, with `locatorFor(LogInButtonHarness)`, instead of querying its markup.
 */
export class LogInButtonHarness extends ComponentHarness {
    public static readonly hostSelector = 'app-log-in-button';

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
