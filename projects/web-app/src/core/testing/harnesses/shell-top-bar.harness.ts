import { ComponentHarness } from '@angular/cdk/testing';
import { LogInButtonHarness, SignUpButtonHarness } from '@dnd-mapp/web-auth/components/testing';
import { type ButtonVariant } from '@dnd-mapp/web-ui/components';
import { BrandHarness, TopBarHarness } from '@dnd-mapp/web-ui/components/testing';

/**
 * Drives a rendered `ShellTopBarComponent` from a spec. Specs of components that embed the bar reach it through this
 * harness as well, with `locatorFor(ShellTopBarHarness)`, instead of querying its markup.
 */
export class ShellTopBarHarness extends ComponentHarness {
    public static readonly hostSelector = 'app-shell-top-bar';

    private readonly topBarLocator = this.locatorForOptional(TopBarHarness);
    private readonly brandLocator = this.locatorFor(BrandHarness);
    private readonly logInButtonLocator = this.locatorFor(LogInButtonHarness);
    private readonly signUpButtonLocator = this.locatorFor(SignUpButtonHarness);

    /**
     * Checks whether the bar is the shared top bar, rather than chrome of its own.
     *
     * @returns `true` when a shared top bar is present, `false` when it is not.
     */
    public async hasTopBar(): Promise<boolean> {
        return (await this.topBarLocator()) !== null;
    }

    /**
     * Reads the application's name as the bar carries it.
     *
     * @returns The text the wordmark shows.
     */
    public async brandName(): Promise<string> {
        return await (await this.brandLocator()).name();
    }

    /**
     * Reads the labels of the account actions the bar offers.
     *
     * @returns The labels in the order the buttons appear, left to right.
     */
    public async actionLabels(): Promise<string[]> {
        const [logInButton, signUpButton] = await Promise.all([this.logInButtonLocator(), this.signUpButtonLocator()]);

        return await Promise.all([logInButton.label(), signUpButton.label()]);
    }

    /**
     * Reads the weight each account action carries, so a spec can tell which of them the bar leads with.
     *
     * @returns The variants in the order the buttons appear, left to right, lined up with `actionLabels`.
     */
    public async actionVariants(): Promise<ButtonVariant[]> {
        const [logInButton, signUpButton] = await Promise.all([this.logInButtonLocator(), this.signUpButtonLocator()]);

        return await Promise.all([logInButton.variant(), signUpButton.variant()]);
    }
}
