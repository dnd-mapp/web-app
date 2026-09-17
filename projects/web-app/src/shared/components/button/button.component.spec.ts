import { ButtonComponent } from '@/components';
import { ButtonHarness } from '@/components/testing';
import { setupTestEnvironment } from '@/testing';
import { Component, signal, type Type } from '@angular/core';

describe('ButtonComponent', () => {
    /** Hosts the component under test the way a page would, so the spec renders it through a template. */
    @Component({
        selector: 'app-test',
        template: `<button appButton (click)="onClick()">Save</button>`,
        imports: [ButtonComponent],
    })
    class TestComponent {
        public readonly clicked = signal(false);

        protected onClick() {
            this.clicked.set(true);
        }
    }

    /** Hosts the button a page leads with, the variant that carries the accent color. */
    @Component({
        selector: 'app-primary-test',
        template: `<button appButton variant="primary">Save</button>`,
        imports: [ButtonComponent],
    })
    class PrimaryTestComponent {}

    /** Hosts a button whose variant attribute carries no value, the case the input's transform has to absorb. */
    @Component({
        selector: 'app-empty-variant-test',
        template: `<button appButton variant>Save</button>`,
        imports: [ButtonComponent],
    })
    class EmptyVariantTestComponent {}

    /** Hosts a button that asks to submit its form, the one case the component's default `type` has to yield to. */
    @Component({
        selector: 'app-submit-test',
        template: `<button appButton type="submit">Save</button>`,
        imports: [ButtonComponent],
    })
    class SubmitTestComponent {}

    /**
     * Renders a host component and loads the harness a test asserts through.
     *
     * @typeParam T The host component's class, inferred from the argument so a test reads the host's members typed.
     * @param testComponent The host component to render.
     * @returns The loaded harness and the rendered host component.
     */
    async function setupTest<T>(testComponent: Type<T>) {
        const { harness, componentInstance } = await setupTestEnvironment({
            testComponent: testComponent,
            harness: ButtonHarness,
        });

        return {
            harness: harness,
            componentInstance: componentInstance,
        };
    }

    it('should render its content as the label', async () => {
        const { harness } = await setupTest(TestComponent);
        expect(await harness.label()).toEqual('Save');
    });

    it('should carry no emphasis by default', async () => {
        const { harness } = await setupTest(TestComponent);
        expect(await harness.variant()).toEqual('default');
    });

    it('should render as the primary action when a page asks for it', async () => {
        const { harness } = await setupTest(PrimaryTestComponent);
        expect(await harness.variant()).toEqual('primary');
    });

    it('should fall back to the default for an attribute that names no variant', async () => {
        const { harness } = await setupTest(EmptyVariantTestComponent);
        expect(await harness.variant()).toEqual('default');
    });

    it('should not submit a form it sits in', async () => {
        const { harness } = await setupTest(TestComponent);
        expect(await harness.isSubmit()).toBe(false);
    });

    it('should submit a form when the element asks for it', async () => {
        const { harness } = await setupTest(SubmitTestComponent);
        expect(await harness.isSubmit()).toBe(true);
    });

    it('should hand a click to the page', async () => {
        const { harness, componentInstance } = await setupTest(TestComponent);

        expect(componentInstance.clicked()).toEqual(false);

        await harness.click();
        expect(componentInstance.clicked()).toEqual(true);
    });
});
