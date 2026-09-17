import { type BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { type ButtonVariant, buttonVariants } from '@dnd-mapp/shared/components';

/** Narrows the buttons `ButtonHarness.with` matches, on top of the ancestor and selector filters every harness has. */
export interface ButtonHarnessFilters extends BaseHarnessFilters {
    /** The label the button shows, matched in full. */
    label?: string;
}

/**
 * Drives a rendered `ButtonComponent`, a native `button` carrying the `appButton` attribute, from a spec. Specs of
 * components that embed a button reach it through this harness as well, with `locatorFor(ButtonHarness)` or
 * `locatorFor(ButtonHarness.with({ label }))` to pick one out, instead of querying its markup.
 */
export class ButtonHarness extends ComponentHarness {
    public static readonly hostSelector = 'button[appButton]';

    /**
     * Builds a predicate that matches the buttons satisfying the filters.
     *
     * @param filters What the button has to show to match; an empty object matches every button.
     * @returns The predicate to hand to a locator.
     */
    public static with(filters: ButtonHarnessFilters = {}): HarnessPredicate<ButtonHarness> {
        return new HarnessPredicate(ButtonHarness, filters).addOption('label', filters.label, (harness, label) =>
            HarnessPredicate.stringMatches(harness.label(), label),
        );
    }

    /**
     * Reads the label.
     *
     * @returns The text the button shows.
     */
    public async label(): Promise<string> {
        return await (await this.host()).text();
    }

    /**
     * Reads the weight the button carries.
     *
     * @returns The variant the button renders as.
     */
    public async variant(): Promise<ButtonVariant> {
        return (await (await this.host()).hasClass('primary')) ? buttonVariants.primary : buttonVariants.default;
    }

    /**
     * Checks whether the button submits the form it sits in.
     *
     * @returns `true` for a submit button, `false` for a plain push button.
     */
    public async isSubmit(): Promise<boolean> {
        return (await (await this.host()).getAttribute('type')) === 'submit';
    }

    /** Clicks the button. */
    public async click(): Promise<void> {
        await (await this.host()).click();
    }
}
